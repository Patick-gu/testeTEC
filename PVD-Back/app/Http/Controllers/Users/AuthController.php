<?php

namespace App\Http\Controllers\Users;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

use App\Models\User;

/**
 * @group Autenticação
 *
 * APIs para gerenciamento de login e geração de tokens JWT.
 */
class AuthController extends Controller
{
    /**
     * Login do Usuário
     *
     * Autentica um usuário usando e-mail e senha e retorna um token JWT (JSON Web Token) 
     * que deve ser usado no header "Authorization: Bearer {token}" nas rotas privadas.
     *
     * @bodyParam email string required O e-mail de acesso do usuário. Example: patrick@kasterweb.com
     * @bodyParam password string required A senha do usuário. Example: secreta123
     * 
     * @response 200 {
     *   "acess_Token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
     *   "token_type": "bearer",
     *   "expires_in": 3600
     * }
     * @response 401 {
     *   "error": "Unauthorized"
     * }
     */
    public function login(Request $request){
        $credentials=$request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if(!$token = auth('api')->attempt($credentials)){
                return response()->json(['error' => 'Unauthorized'], 401);
        };

        return response()->json([
            'acess_Token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
        ]);
    }
    /**
     * Logout
     *
     * Invalida o Token JWT atual (adiciona na Blacklist).
     */
    public function logout()
    {
        auth("api")->logout();

        return response()->json(["message" => "Logout realizado com sucesso! Token invalidado."]);
    }

}
