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

export type FileInfo = {
  /**
   * Signifies that the requested file exist.
   */
  exists: boolean;
  /**
   * A `file://` URI pointing to the file. This is the same as the `fileUri` input parameter.
   */
  uri: string;
  /**
   * The size of the file in bytes. If operating on a source such as an iCloud file, only present if the `size` option was truthy.
   */
  size?: number;
  /**
   * Boolean set to `true` if this is a directory and `false` if it is a file.
   */
  isDirectory: boolean;
  /**
   * The last modification time of the file expressed in seconds since epoch.
   */
  modificationTime?: number;
  /**
   * Present if the `md5` option was truthy. Contains the MD5 hash of the file.
   */
  md5?: string;
};
