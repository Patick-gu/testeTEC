<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    protected $fillable=[
        'name',
        'email',
        'password',
    ];
    public function getJWTIdentifier(){
        return $this->getKey();
    }
    //aqui pode ir os dados adicionais dentro do token.
    public function getJWTCustomClaims(){
        return [];
    }

}
