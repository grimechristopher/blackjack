

export async function isValidAuth() {
  // send api call to api using auth
  // If fails then return false
  // If success then return true
  let result = null;
  try {
    result = await fetch('http://localhost:3000/api/auth/validate-token', {
      method: 'GET',
      credentials: 'include',
    })
  } catch (error) {
    console.info("Provided token is invalid");
    return false;
  }
  if (result?.status === 200) {
    return true;
  }
  return false;
}