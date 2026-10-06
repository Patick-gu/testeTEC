<?php

namespace App\Http\Controllers\Estoque;

use App\Models\Produto;
use App\Models\Categoria;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ProdutoImportController
{
    /**
     * Download Excel Template
     */
    public function template()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Produtos');
        
        // Headers
        $sheet->setCellValue('A1', 'code');
        $sheet->setCellValue('B1', 'name');
        $sheet->setCellValue('C1', 'price');
        $sheet->setCellValue('D1', 'stock_quantity');
        $sheet->setCellValue('E1', 'categoria_id');
        
        // Fetch a real category to serve as example
        $exampleCategory = Categoria::first();
        $catId = $exampleCategory ? $exampleCategory->id : 'CRIE-UMA-CATEGORIA-PRIMEIRO';

        // Sample data
        $sheet->setCellValue('A2', '789102030');
        $sheet->setCellValue('B2', 'Produto de Exemplo');
        $sheet->setCellValue('C2', '99.90');
        $sheet->setCellValue('D2', '15');
        $sheet->setCellValue('E2', $catId);

        // Add a second sheet to show valid categories
        $spreadsheet->createSheet();
        $sheet2 = $spreadsheet->setActiveSheetIndex(1);
        $sheet2->setTitle('Categorias Validas');
        $sheet2->setCellValue('A1', 'ID da Categoria (Copiar)');
        $sheet2->setCellValue('B1', 'Nome da Categoria');
        
        $categorias = Categoria::orderBy('name')->get();
        $rowCat = 2;
        foreach($categorias as $cat) {
            $sheet2->setCellValue('A' . $rowCat, $cat->id);
            $sheet2->setCellValue('B' . $rowCat, $cat->name);
            $rowCat++;
        }

        // Set focus back to first sheet
        $spreadsheet->setActiveSheetIndex(0);

        $writer = new Xlsx($spreadsheet);
        
        $temp_file = tempnam(sys_get_temp_dir(), 'template');
        $writer->save($temp_file);
        
        return response()->download($temp_file, 'produtos_modelo.xlsx')->deleteFileAfterSend(true);
    }

    /**
     * Import Products from Excel
     */
    public function import(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $request->validate([
            'file' => 'required|mimes:xlsx,xls|max:2048'
        ]);

        $file = $request->file('file');
        
        try {
            $spreadsheet = IOFactory::load($file->getRealPath());
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();
            
            $headers = array_shift($rows); // Remove headers
            
            $importedCount = 0;
            
            foreach ($rows as $index => $row) {
                // Assuming columns: A=code, B=name, C=price, D=stock_quantity, E=categoria_id
                if (empty($row[0]) || empty($row[1])) continue; // Skip empty rows

                $catId = $row[4] ?? null;
                if ($catId && !Categoria::find($catId)) {
                    return response()->json(['error' => "Linha " . ($index + 2) . ": O ID de categoria '{$catId}' não existe no sistema."], 422);
                }
                
                Produto::updateOrCreate(
                    ['code' => $row[0]], // condition
                    [
                        'name' => $row[1],
                        'price' => (float) $row[2],
                        'stock_quantity' => (int) $row[3],
                        'categoria_id' => $catId,
                        'active' => true,
                    ]
                );
                
                $importedCount++;
            }
            
            return response()->json(['message' => "Importação concluída. $importedCount produtos processados."], 200);
            
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erro ao processar arquivo: ' . $e->getMessage()], 500);
        }
    }
}
