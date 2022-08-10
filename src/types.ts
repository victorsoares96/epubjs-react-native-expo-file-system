export type FileSystem = {
  file: string | null;
  progress: number;
  downloading: boolean;
  size: number;
  error: string | null;
  success: boolean;
  downloadFile: (
    fromUrl: string,
    toFile: string
  ) => Promise<{ uri: string | null; mimeType: string | null }>;
  getFileInfo: (fileUri: string) => Promise<{
    uri: string;
    exists: boolean;
    isDirectory: boolean;
    size: number | undefined;
  }>;
};
