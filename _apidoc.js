// ------------------------------------------------------------------------------------------
// Current Errors.
// ------------------------------------------------------------------------------------------
/**
 * @apiDefine AuthenticationError JWT Authentication failed
 * @apiVersion 0.1.0
 *
 * @apiError (Error 401) Unauthorized
 *           'x-access-token' was not provided on request headers
 * @apiError (Error 500) JwtInternalServerError
 *           Unexpected error verifying JWT token
 */

// ------------------------------------------------------------------------------------------
// Current Permissions.
// ------------------------------------------------------------------------------------------
/**
 * @apiDefine Manager Manager profile required
 *    This action can only be performed by a user with Manager profile
 *
 * @apiVersion 0.1.0
 */
