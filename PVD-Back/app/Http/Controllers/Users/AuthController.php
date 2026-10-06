<?php

namespace App\Http\Controllers\Users;

use App\Services\AuthService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

/**
 * @group Autenticação
 *
 * APIs para gerenciamento de login e geração de tokens JWT.
 */
class AuthController extends Controller
{
    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

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
    public function login(Request $request): JsonResponse
    {
        try {
            $credentials = $request->validate([
                'email' => 'required|string|email',
                'password' => 'required|string',
            ]);

            $resultado = $this->authService->login($credentials);

            return response()->json($resultado);
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 401;
            if (!is_numeric($statusCode) || $statusCode < 100 || $statusCode > 599) {
                $statusCode = 401;
            }
            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
    }

    /**
     * Logout
     *
     * Invalida o Token JWT atual (adiciona na Blacklist).
     */
    public function logout(): JsonResponse
    {
        try {
            $this->authService->logout();

            return response()->json(["message" => "Logout realizado com sucesso! Token invalidado."]);
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 400;
            if (!is_numeric($statusCode) || $statusCode < 100 || $statusCode > 599) {
                $statusCode = 400;
            }
            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
    }
}
