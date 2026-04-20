import axios from "axios";
import { apiClient } from "@/lib/api";

const DIRECT_UPLOAD_LIMIT_BYTES = 50 * 1024 * 1024;

type ApiEnvelope<T> = {
  data: T;
};

type UploadDirectResponse = {
  strategy: "direct";
  file_url: string;
  file_key: string;
  mime_type: string;
  file_size_bytes: number;
  file_name: string;
};

type PresignedUrlResponse = {
  strategy: "presigned";
  upload_url: string;
  file_key: string;
  public_url: string;
  file_name: string;
  mime_type: string;
  expires_in: number;
  required_headers?: Record<string, string>;
};

type ConfirmUploadResponse = {
  file_url: string;
  file_key: string;
  mime_type: string;
  file_size_bytes: number;
  file_name: string;
};

export type UploadedFileResult = {
  file_url: string;
  file_key: string;
  mime_type: string;
  file_size_bytes: number;
  file_name: string;
};

function normalizeUploadResponse(
  payload: UploadDirectResponse | ConfirmUploadResponse,
): UploadedFileResult {
  return {
    file_url: payload.file_url,
    file_key: payload.file_key,
    mime_type: payload.mime_type,
    file_size_bytes: payload.file_size_bytes,
    file_name: payload.file_name,
  };
}

async function uploadSmallFile(file: File): Promise<UploadedFileResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<ApiEnvelope<UploadDirectResponse>>(
    "/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return normalizeUploadResponse(response.data.data);
}

async function uploadLargeFile(file: File): Promise<UploadedFileResult> {
  const presignedResponse = await apiClient.post<
    ApiEnvelope<PresignedUrlResponse>
  >("/upload/presigned-url", {
    file_name: file.name,
    mime_type: file.type || "application/octet-stream",
    file_size_bytes: file.size,
    folder: "",
  });

  const presignedData = presignedResponse.data.data;
  const requiredHeaders = presignedData.required_headers ?? {};
  const contentType =
    requiredHeaders["Content-Type"] ||
    presignedData.mime_type ||
    file.type ||
    "application/octet-stream";
  const payloadHash =
    requiredHeaders["x-amz-content-sha256"] || "UNSIGNED-PAYLOAD";

  await axios.put(presignedData.upload_url, file, {
    headers: {
      "Content-Type": contentType,
      "x-amz-content-sha256": payloadHash,
    },
  });

  const confirmResponse = await apiClient.post<
    ApiEnvelope<ConfirmUploadResponse>
  >("/upload/confirm", {
    file_key: presignedData.file_key,
    file_name: presignedData.file_name,
  });

  return normalizeUploadResponse(confirmResponse.data.data);
}

export async function uploadFileToStorage(
  file: File,
): Promise<UploadedFileResult> {
  if (file.size < DIRECT_UPLOAD_LIMIT_BYTES) {
    return uploadSmallFile(file);
  }

  return uploadLargeFile(file);
}
