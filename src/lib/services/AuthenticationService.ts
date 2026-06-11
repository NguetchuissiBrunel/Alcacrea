/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ForgotPasswordRequest } from '../models/ForgotPasswordRequest';
import type { LoginRequest } from '../models/LoginRequest';
import type { ResetPasswordRequest } from '../models/ResetPasswordRequest';
import type { UserCreate } from '../models/UserCreate';
import type { UserUpdate } from '../models/UserUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthenticationService {
    /**
     * Register
     * Enregistre un nouvel utilisateur.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static registerApiV1AuthRegisterPost(
        requestBody: UserCreate,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Login
     * Connexion utilisateur (JSON body).
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static loginApiV1AuthLoginPost(
        requestBody: LoginRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Refresh
     * Rafraîchit l'access token à partir du refresh token (Bearer).
     * @param authorization
     * @returns any Successful Response
     * @throws ApiError
     */
    public static refreshApiV1AuthRefreshPost(
        authorization?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/refresh',
            headers: {
                'authorization': authorization,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Forgot Password
     * Demande de réinitialisation du mot de passe (génère un lien envoyé par email).
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static forgotPasswordApiV1AuthForgotPasswordPost(
        requestBody: ForgotPasswordRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/forgot-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Reset Password
     * Réinitialise le mot de passe à l'aide du token envoyé par email.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static resetPasswordApiV1AuthResetPasswordPost(
        requestBody: ResetPasswordRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/reset-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Me
     * Récupère le profil de l'utilisateur connecté.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getMeApiV1AuthMeGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/auth/me',
        });
    }
    /**
     * Update Me
     * Met à jour le profil (nom ou mot de passe).
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static updateMeApiV1AuthMePut(
        requestBody: UserUpdate,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/auth/me',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
