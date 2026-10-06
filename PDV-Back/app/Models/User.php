<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable implements JWTSubject
{
    use HasUuids, HasFactory;

    protected $fillable=[
        'name',
        'email',
        'password',
        'role',
        'status'
    ];
    public function getJWTIdentifier(){
        return $this->getKey();
    }
    //aqui pode ir os dados adicionais dentro do token.
    public function getJWTCustomClaims(){
        return [
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'status' => $this->status
        ];
    }

}
