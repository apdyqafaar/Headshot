"use client"

import { useUser } from "@/lib/context"

const userPage = () => {
   const {user}=useUser()
  return (
    <div>adminPage ${user?.name}</div>
  )

}

export default userPage