import { ISkyotFile } from "skyot";

export interface IUpload {
  upload(files: ISkyotFile): Promise<{ url: string }>;
}
