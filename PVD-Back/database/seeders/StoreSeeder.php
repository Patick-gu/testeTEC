<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Categoria;
use App\Models\Produto;

class StoreSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('TRUNCATE TABLE produtos CASCADE');
        DB::statement('TRUNCATE TABLE categorias CASCADE');

        $categorias = [
            'Laticinios' => [
                ['name' => 'Leite Integral 1L', 'price' => 5.50, 'code' => '78910101'],
                ['name' => 'Queijo Mussarela 1kg', 'price' => 35.90, 'code' => '78910102'],
                ['name' => 'Iogurte Natural 170g', 'price' => 2.99, 'code' => '78910103'],
                ['name' => 'Manteiga com Sal 200g', 'price' => 8.50, 'code' => '78910104'],
                ['name' => 'Requeijao Cremoso 200g', 'price' => 6.99, 'code' => '78910105'],
                ['name' => 'Creme de Leite 200g', 'price' => 3.49, 'code' => '78910106'],
                ['name' => 'Leite Condensado 395g', 'price' => 5.90, 'code' => '78910107'],
                ['name' => 'Margarina 500g', 'price' => 7.20, 'code' => '78910108'],
                ['name' => 'Queijo Prato 500g', 'price' => 22.90, 'code' => '78910109'],
                ['name' => 'Bebida Lactea Sabor Morango', 'price' => 3.99, 'code' => '78910110'],
            ],
            'Bebidas' => [
                ['name' => 'Refrigerante Cola 2L', 'price' => 8.99, 'code' => '78910201'],
                ['name' => 'Suco de Uva Integral 1L', 'price' => 14.50, 'code' => '78910202'],
                ['name' => 'Agua Mineral Sem Gas 500ml', 'price' => 1.50, 'code' => '78910203'],
                ['name' => 'Cerveja Pilsen 350ml', 'price' => 3.49, 'code' => '78910204'],
                ['name' => 'Refrigerante Guarana 2L', 'price' => 7.99, 'code' => '78910205'],
                ['name' => 'Suco de Laranja 1L', 'price' => 11.90, 'code' => '78910206'],
                ['name' => 'Agua Mineral Com Gas 500ml', 'price' => 1.90, 'code' => '78910207'],
                ['name' => 'Energetico 250ml', 'price' => 8.50, 'code' => '78910208'],
                ['name' => 'Cha Gelado Pessego 1L', 'price' => 6.99, 'code' => '78910209'],
                ['name' => 'Agua Tonica 350ml', 'price' => 3.20, 'code' => '78910210'],
            ],
            'Mercearia' => [
                ['name' => 'Arroz Branco 5kg', 'price' => 25.90, 'code' => '78910301'],
                ['name' => 'Feijao Carioca 1kg', 'price' => 7.80, 'code' => '78910302'],
                ['name' => 'Oleo de Soja 900ml', 'price' => 5.90, 'code' => '78910303'],
                ['name' => 'Macarrao Espaguete 500g', 'price' => 4.20, 'code' => '78910304'],
                ['name' => 'Cafe Torrado 500g', 'price' => 15.90, 'code' => '78910305'],
                ['name' => 'Azeite Extra Virgem 500ml', 'price' => 29.90, 'code' => '78910306'],
                ['name' => 'Acucar Refinado 1kg', 'price' => 4.50, 'code' => '78910307'],
                ['name' => 'Farinha de Trigo 1kg', 'price' => 5.20, 'code' => '78910308'],
                ['name' => 'Sal Refinado 1kg', 'price' => 2.10, 'code' => '78910309'],
                ['name' => 'Molho de Tomate 340g', 'price' => 2.50, 'code' => '78910310'],
            ],
            'Padaria' => [
                ['name' => 'Pao Frances', 'price' => 0.50, 'code' => '78910401'],
                ['name' => 'Pao de Forma', 'price' => 7.50, 'code' => '78910402'],
                ['name' => 'Bolo de Chocolate', 'price' => 15.00, 'code' => '78910403'],
                ['name' => 'Biscoito Agua e Sal 400g', 'price' => 5.80, 'code' => '78910404'],
                ['name' => 'Torrada Tradicional 160g', 'price' => 4.90, 'code' => '78910405'],
                ['name' => 'Pao de Hamburguer', 'price' => 6.50, 'code' => '78910406'],
                ['name' => 'Pao de Hot Dog', 'price' => 5.90, 'code' => '78910407'],
                ['name' => 'Bolo de Cenoura', 'price' => 14.50, 'code' => '78910408'],
            ],
            'Limpeza' => [
                ['name' => 'Detergente Liquido 500ml', 'price' => 2.20, 'code' => '78910501'],
                ['name' => 'Sabao em Po 1kg', 'price' => 12.90, 'code' => '78910502'],
                ['name' => 'Amaciante de Roupas 2L', 'price' => 9.80, 'code' => '78910503'],
                ['name' => 'Desinfetante 1L', 'price' => 5.50, 'code' => '78910504'],
                ['name' => 'Agua Sanitaria 2L', 'price' => 4.50, 'code' => '78910505'],
                ['name' => 'Esponja de Aco 8un', 'price' => 3.20, 'code' => '78910506'],
                ['name' => 'Limpador Multiuso 500ml', 'price' => 4.90, 'code' => '78910507'],
                ['name' => 'Sabao em Barra 5un', 'price' => 8.90, 'code' => '78910508'],
            ],
            'Higiene' => [
                ['name' => 'Sabonete em Barra 90g', 'price' => 1.80, 'code' => '78910601'],
                ['name' => 'Creme Dental 90g', 'price' => 3.50, 'code' => '78910602'],
                ['name' => 'Shampoo 350ml', 'price' => 14.90, 'code' => '78910603'],
                ['name' => 'Papel Higienico 4 Rolos', 'price' => 6.90, 'code' => '78910604'],
                ['name' => 'Condicionador 350ml', 'price' => 16.90, 'code' => '78910605'],
                ['name' => 'Desodorante Aerosol 150ml', 'price' => 12.50, 'code' => '78910606'],
                ['name' => 'Absorvente com Abas 8un', 'price' => 5.90, 'code' => '78910607'],
                ['name' => 'Aparelho de Barbear 2un', 'price' => 7.80, 'code' => '78910608'],
            ],
            'Congelados' => [
                ['name' => 'Pizza Calabresa Congelada', 'price' => 16.90, 'code' => '78910701'],
                ['name' => 'Hamburguer de Carne', 'price' => 12.50, 'code' => '78910702'],
                ['name' => 'Pao de Queijo Congelado 400g', 'price' => 9.90, 'code' => '78910703'],
                ['name' => 'Batata Palito Congelada 1kg', 'price' => 15.90, 'code' => '78910704'],
                ['name' => 'Lasanha a Bolonhesa 600g', 'price' => 18.50, 'code' => '78910705'],
                ['name' => 'Isca de Frango Empanada 300g', 'price' => 11.90, 'code' => '78910706'],
            ],
            'Acougue' => [
                ['name' => 'Carne Moida 1kg', 'price' => 28.90, 'code' => '78910801'],
                ['name' => 'Peito de Frango 1kg', 'price' => 18.50, 'code' => '78910802'],
                ['name' => 'Linguica Toscana 1kg', 'price' => 22.90, 'code' => '78910803'],
                ['name' => 'Coxao Mole 1kg', 'price' => 38.90, 'code' => '78910804'],
                ['name' => 'Picanha 1kg', 'price' => 69.90, 'code' => '78910805'],
            ],
            'Hortifruti' => [
                ['name' => 'Maca Gala 1kg', 'price' => 8.90, 'code' => '78910901'],
                ['name' => 'Banana Prata 1kg', 'price' => 5.50, 'code' => '78910902'],
                ['name' => 'Laranja Pera 1kg', 'price' => 4.90, 'code' => '78910903'],
                ['name' => 'Tomate Carmem 1kg', 'price' => 7.90, 'code' => '78910904'],
                ['name' => 'Cebola Branca 1kg', 'price' => 5.90, 'code' => '78910905'],
                ['name' => 'Batata Inglesa 1kg', 'price' => 6.50, 'code' => '78910906'],
                ['name' => 'Cenoura 1kg', 'price' => 4.50, 'code' => '78910907'],
            ],
            'Pets' => [
                ['name' => 'Racao para Caes Adultos 1kg', 'price' => 14.90, 'code' => '78911001'],
                ['name' => 'Racao para Gatos Adultos 1kg', 'price' => 16.50, 'code' => '78911002'],
                ['name' => 'Petisco Osso para Caes', 'price' => 5.90, 'code' => '78911003'],
                ['name' => 'Areia Higienica Gatos 4kg', 'price' => 12.90, 'code' => '78911004'],
                ['name' => 'Shampoo para Caes 500ml', 'price' => 18.90, 'code' => '78911005'],
            ],
            'Papelaria' => [
                ['name' => 'Caderno Espiral 96 folhas', 'price' => 12.90, 'code' => '78911101'],
                ['name' => 'Caneta Esferografica Azul', 'price' => 1.50, 'code' => '78911102'],
                ['name' => 'Lapis de Cor 12 Cores', 'price' => 8.90, 'code' => '78911103'],
                ['name' => 'Borracha Branca', 'price' => 0.80, 'code' => '78911104'],
                ['name' => 'Apontador com Deposito', 'price' => 3.50, 'code' => '78911105'],
            ]
        ];

        foreach ($categorias as $catName => $produtos) {
            $categoria = Categoria::create(['name' => $catName]);

            foreach ($produtos as $prod) {
                // Calculate wholesale: 2 to 6 items minimum, and 0% to 2% discount
                $discountPercent = rand(5, 20) / 10; // 0.5% to 2.0%
                $wholesaleMinQty = rand(2, 6);
                $wholesalePrice = round($prod['price'] * (1 - ($discountPercent / 100)), 2);

                // Small correction: ensure wholesale_price is always < price, 
                // just in case price is very small and rounding makes them equal.
                if ($wholesalePrice >= $prod['price']) {
                    $wholesalePrice = max(0.01, $prod['price'] - 0.05);
                }

                Produto::create([
                    'categoria_id' => $categoria->id,
                    'name' => $prod['name'],
                    'code' => $prod['code'],
                    'price' => $prod['price'],
                    'wholesale_price' => $wholesalePrice,
                    'wholesale_min_quantity' => $wholesaleMinQty,
                    'stock_quantity' => rand(30, 200),
                    'active' => true,
                ]);
            }
        }
    }
}
