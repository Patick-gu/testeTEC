<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $password = Hash::make('123456');

        // Criando 1 Admin Culto
        User::create([
            'name' => 'Machado de Assis',
            'email' => 'admin@pdv.com',
            'password' => $password,
            'role' => 'admin',
            'status' => 'active',
        ]);

        // Criando 5 Operadores Cultos
        // Nota: O banco de dados só aceita enum ['admin', 'user'].
        // Portanto, o papel "operador" será cadastrado como "user".
        $operadores = [
            'Clarice Lispector',
            'Fernando Pessoa',
            'Cecília Meireles',
            'João Guimarães Rosa',
            'Graciliano Ramos',
        ];

        foreach ($operadores as $index => $nome) {
            User::create([
                'name' => $nome,
                'email' => 'operador'.($index + 1).'@pdv.com',
                'password' => $password,
                'role' => 'user',
                'status' => 'active',
            ]);
        }
    }
}
