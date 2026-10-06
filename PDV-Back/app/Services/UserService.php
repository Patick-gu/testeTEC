<?php

namespace App\Services;

use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function getUsers($user, array $filters)
    {
        if ($user->role !== 'admin') {
            throw new Exception('Acesso negado.', 403);
        }

        $query = User::query();

        if (!empty($filters['name'])) {
            $query->where('name', 'ilike', '%' . $filters['name'] . '%');
        }

        return $query->get();
    }

    public function createUser($user, array $data)
    {
        if ($user->role !== 'admin') {
            throw new Exception('Acesso negado.', 403);
        }

        $data['password'] = Hash::make($data['password']);

        return User::create($data);
    }

    public function updateUser($userAuth, User $user, array $data)
    {
        if ($userAuth->role !== 'admin') {
            throw new Exception('Acesso negado.', 403);
        }

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        return $user;
    }

    public function deleteUser($userAuth, User $user)
    {
        if ($userAuth->role !== 'admin') {
            throw new Exception('Acesso negado.', 403);
        }

        $user->delete();
    }
}
