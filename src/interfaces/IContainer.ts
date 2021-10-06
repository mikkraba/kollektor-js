export interface IContainer {
    name: string;
    selector: string;
    nameAttribute?: string;
    condition?: ((element: HTMLElement) => boolean);
}