<?php

namespace App\Http\Controllers\Users;

use App\Models\User;
use App\Services\UserService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * @group Usuários
 *
 * APIs para gerenciamento de usuários do PDV.
 */
class UserController
{
    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

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
    public function store(Request $request): JsonResponse
    {
        try {
            $dadosValidados = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|min:6',
                'role' => 'required|in:admin,user',
                'status' => 'sometimes|in:active,off',
            ]);

            $user = $this->userService->createUser(auth()->user(), $dadosValidados);

            return response()->json($user, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 400;
            if (!is_numeric($statusCode) || $statusCode < 100 || $statusCode > 599) {
                $statusCode = 400;
            }
            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
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
    public function index(Request $request): JsonResponse
    {
        try {
            $usuarios = $this->userService->getUsers(auth()->user(), $request->only(['name']));

            return response()->json($usuarios);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 400;
            if (!is_numeric($statusCode) || $statusCode < 100 || $statusCode > 599) {
                $statusCode = 400;
            }
            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
    }

    public function update(Request $request, User $user): JsonResponse
    {
        try {
            $dadosValidados = $request->validate([
                'name' => 'sometimes|string|max:255',
                'email' => [
                    'sometimes',
                    'email',
                    Rule::unique('users')->ignore($user->id),
                ],
                'password' => 'sometimes|min:6',
                'role' => 'sometimes|in:admin,user',
                'status' => 'sometimes|in:active,off',
            ]);

            $updatedUser = $this->userService->updateUser(auth()->user(), $user, $dadosValidados);

            return response()->json($updatedUser);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 400;
            if (!is_numeric($statusCode) || $statusCode < 100 || $statusCode > 599) {
                $statusCode = 400;
            }
            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
    }

    /**
     * Deletar Usuário
     *
     * Remove um atendente do sistema pelo seu UUID.
     */
    public function destroy(User $user): JsonResponse
    {
        try {
            $this->userService->deleteUser(auth()->user(), $user);

            return response()->json([
                'message' => 'Usuário deletado com sucesso!',
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 400;
            if (!is_numeric($statusCode) || $statusCode < 100 || $statusCode > 599) {
                $statusCode = 400;
            }
            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
    }
}
