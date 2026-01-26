import crypto from "crypto"
export class VerificationService{
    private readonly tokenLength=32
    private readonly tokenExpires=24 // 1 day

    // generate verification token
     generateVerificationToken():string{
        return crypto.randomBytes(this.tokenLength).toString("hex")
    }

    // generate expiration date for verification token
    generateExpirationDate():Date{
        const expires=new Date()
        expires.setHours(expires.getHours() + this.tokenExpires)
        return expires
    }

    // check if token expires
    isTokenExpired(expires:Date):boolean{
        return new Date() > expires 
    }
}

export const verificationService= new VerificationService()