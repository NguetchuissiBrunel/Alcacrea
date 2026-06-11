/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_upload_pdf_api_v1_pdf_upload_post } from '../models/Body_upload_pdf_api_v1_pdf_upload_post';
import type { PDFStatus } from '../models/PDFStatus';
import type { PDFType } from '../models/PDFType';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PdfUploadService {
    /**
     * Upload Pdf
     * Reçoit un fichier PDF, valide son type et sa taille, l'enregistre temporairement,
     * crée une entrée de suivi en base et lance le traitement en tâche de fond.
     * @param formData
     * @returns any Successful Response
     * @throws ApiError
     */
    public static uploadPdfApiV1PdfUploadPost(
        formData: Body_upload_pdf_api_v1_pdf_upload_post,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/pdf/upload',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Pdf Status
     * Récupère le statut de traitement d'un fichier PDF.
     * @param pdfFileId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getPdfStatusApiV1PdfStatusPdfFileIdGet(
        pdfFileId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/pdf/status/{pdf_file_id}',
            path: {
                'pdf_file_id': pdfFileId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Pdfs
     * Liste paginée des PDFs uploadés avec filtres optionnels.
     * @param page
     * @param limit
     * @param pdfType
     * @param status
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listPdfsApiV1PdfListGet(
        page: number = 1,
        limit: number = 10,
        pdfType?: PDFType,
        status?: PDFStatus,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/pdf/list',
            query: {
                'page': page,
                'limit': limit,
                'pdf_type': pdfType,
                'status': status,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Reparse Pdf
     * Relance le parsing d'un fichier PDF qui a échoué.
     * @param pdfFileId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static reparsePdfApiV1PdfReparsePdfFileIdPost(
        pdfFileId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/pdf/reparse/{pdf_file_id}',
            path: {
                'pdf_file_id': pdfFileId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
