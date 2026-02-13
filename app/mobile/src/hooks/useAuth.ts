/**
 * this is dummy auth context
 */
type AuthContext = {
  userId: string
  encKey: string
}
const useAuth = (): AuthContext => {
  return {
    userId: "b500e755-3910-446a-ae6f-796f06214cd0",
    encKey: "test"
  }
}
