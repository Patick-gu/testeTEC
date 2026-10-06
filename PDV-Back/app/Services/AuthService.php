<?php

namespace App\Services;

use Exception;

class AuthService
{
    public function login(array $credentials)
    {
        $credentials['status'] = 'active';

        if (!$token = auth('api')->attempt($credentials)) {
            throw new Exception('Unauthorized', 401);
        }

        return [
            'acess_Token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
        ];
    }

    public function logout()
    {
        auth('api')->logout();
    }
}
