import { config } from "@/config";
import { UserRole } from "@/models/User.model";
import { UnauthorizedError } from "@/util/errors";
import  jwt, {SignOptions} from "jsonwebtoken";
import type {StringValue} from 'ms'

export interface TokenPayload{
    email:string;
    userId:string;
    role:UserRole
}

export class TokenService{

//   generate access token
generateAccessToken(payload:TokenPayload):string{
    const secret=this.getAccessSecret()

    const options:SignOptions={
        expiresIn:config.jwt.expiresIn as StringValue
    }

    return jwt.sign(payload, secret, options)
   
}


// refresh token
generateRefreshToken(payload:TokenPayload):string{
    const secret=this.getRefreshSecret()

    const options:SignOptions={
        expiresIn:config.jwt.refreshExpiresIn as StringValue
    }

    return jwt.sign(payload, secret, options)
   
}

// verify access token
verifyAccessToken(token:string):TokenPayload{
     const secret=this.getAccessSecret()

     try {
        return jwt.verify(token, secret) as TokenPayload
     } catch (error) {
        throw new UnauthorizedError("Invalid or expired token")
     }

      
}

// verify access token
verifyRefreshToken(token:string):TokenPayload{
     const secret=this.getRefreshSecret()

     try {
        return jwt.verify(token, secret) as TokenPayload
     } catch (error) {
        throw new UnauthorizedError("Invalid or expired token")
     }

      
}




// generate both access and refresh tokens
generateTokenPair(payload:TokenPayload):{accessToken:string, refreshToken:string}{
  return {
    accessToken:this.generateAccessToken(payload),
    refreshToken:this.generateRefreshToken(payload)
  }
}

// Privet helpers methods
 private getAccessSecret():string{
   const secret=config.jwt.secret
   if(!secret){
    throw new Error("JWT  secret is not found")
   }
   return secret
}

 private getRefreshSecret():string{
   const secret=config.jwt.secret
   if(!secret){
    throw new Error("JWT refresh secret is not found")
   }
   return secret
}
}


export const tokenService=new TokenService()