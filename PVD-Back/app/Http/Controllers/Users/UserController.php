<?php

namespace App\Http\Controllers\Users;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

/**
 * @group Usuários
 *
 * APIs para gerenciamento de usuários do PDV.
 */
class UserController
{
    /**
     * Criar novo usuário
     *
     * Registra um novo usuário no sistema do PDV. Retorna os dados do usuário recém-criado.
     *
     * @bodyParam name string required O nome completo do usuário. Example: Patrick Gutemberg
     * @bodyParam email string required O e-mail de acesso. Deve ser único. Example: patrick@kasterweb.com
     * @bodyParam password string required A senha do usuário (mínimo de 6 caracteres). Example: secreta123
     *
     * @response 201 {
     *   "name": "Patrick Gutemberg",
     *   "email": "patrick@kasterweb.com",
     *   "updated_at": "2024-10-04T12:00:00.000000Z",
     *   "created_at": "2024-10-04T12:00:00.000000Z",
     *   "id": 1
     * }
     * @response 422 {
     *   "message": "The email has already been taken.",
     *   "errors": {
     *     "email": [
     *       "The email has already been taken."
     *     ]
     *   }
     * }
     */
    public function store(Request $request)
    {
        $dadosValidados = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role'=> 'required|in:admin,user', // Obriga passar e apenas admin ou user
            'status'=> 'sometimes|in:active,off' // Opcional, permite criar já inativo se quiser
        ]);

        $dadosValidados['password'] = Hash::make($dadosValidados['password']);

        $user = User::create($dadosValidados);

        return response()->json($user, 201);
    }
    /**
     * Listar ou Buscar Usuários
     *
     * Retorna a lista de todos os usuários (atendentes) cadastrados no PDV.
     * Permite filtragem de busca (case-insensitive) através do parâmetro na URL.
     *
     * @queryParam name string Opcional. Nome ou parte do nome para buscar atendentes. Example: Pat
     *
     * @response 200 [
     *   {
     *     "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
     *     "name": "Patrick Gutemberg",
     *     "email": "patrick@kasterweb.com",
     *     "role": "admin",
     *     "status": "active",
     *     "created_at": "2026-10-04T12:00:00.000000Z",
     *     "updated_at": "2026-10-04T12:00:00.000000Z"
     *   }
     * ]
     * @response 401 {
     *   "message": "Unauthenticated."
     * }
     */
    public function index(Request $request){
        $query = User::query();
        if($request->has('name')){
            $query ->where('name', 'ilike', '%' . $request->name . '%');
        }

        $usuario = $query->get();
        return response()->json($usuario);
    }
    public function update(Request $request, User $user){
        $dadosValidados = $request->validate([
            'name' => 'sometimes|string|max:255', // Troquei de required para sometimes (opcional no update)
            'email' => [
                'sometimes',
                'email',
                \Illuminate\Validation\Rule::unique('users')->ignore($user->id),
            ],
            'password' => 'sometimes|min:6',
            'role' => 'sometimes|in:admin,user', // Se mandar, atualiza. Se não mandar, mantém a antiga.
            'status'=> 'sometimes|in:active,off',
        ]);
        
        if ($request->has('password')) {
            $dadosValidados['password'] = Hash::make($dadosValidados['password']);
        }
        $user->update($dadosValidados);

        return response()->json($user);
    }
    /**
     * Deletar Usuário
     *
     * Remove um atendente do sistema pelo seu UUID.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return response()->json([
            "message" => "Usuário deletado com sucesso!"
        ], 200);
    }

}
