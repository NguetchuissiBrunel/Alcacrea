/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class EfrAvancEService {
    /**
     * List Efr Avancees
     * Liste paginée des examens EFR Avancée avec filtres optionnels.
     * @param page
     * @param limit
     * @param patientNom
     * @param dateExamen
     * @param medecin
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listEfrAvanceesApiV1EfrAvanceeListGet(
        page: number = 1,
        limit: number = 10,
        patientNom?: string,
        dateExamen?: string,
        medecin?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/efr/avancee/list',
            query: {
                'page': page,
                'limit': limit,
                'patient_nom': patientNom,
                'date_examen': dateExamen,
                'medecin': medecin,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Efr Avancee
     * Détail complet d'un examen EFR Avancée.
     * @param id
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getEfrAvanceeApiV1EfrAvanceeIdGet(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/efr/avancee/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Efr Avancee
     * Supprime un examen EFR Avancée (superadmin uniquement).
     * @param id
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteEfrAvanceeApiV1EfrAvanceeIdDelete(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/efr/avancee/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
