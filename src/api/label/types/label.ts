export interface ICreateLabelRequestData {
    label_x: number
    label_y: number
    label_w: number
    label_h: number
    image_id: number
    tag_id: number
}

export interface IUpdateLabelRequestData {
    label_x: number
    label_y: number
    label_w: number
    label_h: number
    tag_id: number
}