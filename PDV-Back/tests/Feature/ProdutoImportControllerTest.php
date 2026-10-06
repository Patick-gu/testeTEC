<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\Produto;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Tests\TestCase;

class ProdutoImportControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_cannot_import_produtos()
    {
        $user = User::factory()->create(['role' => 'user']);
        $file = UploadedFile::fake()->create('produtos.xlsx', 10, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        $response = $this->actingAs($user, 'api')->postJson('/api/produtos/import', [
            'file' => $file
        ]);

        $response->assertStatus(403);
        $response->assertJson(['error' => 'Acesso negado.']);
    }

    public function test_cannot_import_invalid_file_extension()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $file = UploadedFile::fake()->create('produtos.pdf', 10, 'application/pdf');

        $response = $this->actingAs($admin, 'api')->postJson('/api/produtos/import', [
            'file' => $file
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['file']);
    }

    public function test_admin_can_download_template()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Categoria::factory()->create(['name' => 'Categoria Exemplo']);

        $response = $this->actingAs($admin, 'api')->get('/api/produtos/import/template');

        $response->assertStatus(200);
        $response->assertDownload('produtos_modelo.xlsx');
    }

    public function test_admin_can_import_produtos_from_excel()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $categoria = Categoria::factory()->create();

        // Create a temporary excel file
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setCellValue('A1', 'code');
        $sheet->setCellValue('B1', 'name');
        $sheet->setCellValue('C1', 'price');
        $sheet->setCellValue('D1', 'stock_quantity');
        $sheet->setCellValue('E1', 'categoria_id');
        
        $sheet->setCellValue('A2', '777888');
        $sheet->setCellValue('B2', 'Produto Importado');
        $sheet->setCellValue('C2', '50.00');
        $sheet->setCellValue('D2', '20');
        $sheet->setCellValue('E2', $categoria->id);

        $temp_file = tempnam(sys_get_temp_dir(), 'test_import');
        $writer = new Xlsx($spreadsheet);
        $writer->save($temp_file);

        $file = new UploadedFile($temp_file, 'import.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', null, true);

        $response = $this->actingAs($admin, 'api')->postJson('/api/produtos/import', [
            'file' => $file
        ]);

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Importação concluída. 1 produtos processados.']);
        
        $this->assertDatabaseHas('produtos', [
            'code' => '777888',
            'name' => 'Produto Importado',
            'categoria_id' => $categoria->id
        ]);

        unlink($temp_file);
    }
}
