<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use Nette\Schema\ValidationException;

use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request){
        $credentials=$request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);
        //get name  for email
        //$user = User::where('email', $request->email)->first();

        if(!$token = auth('api')->attempt($credentials)){
                return response()->json(['error' => 'Unauthorized'], 401);
        };

        return response()->json([
            'acess_Token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
            //'name' => $user->name

        ]);
    }
}
