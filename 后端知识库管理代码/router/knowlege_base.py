from fastapi import APIRouter, Depends, File, UploadFile, Query, Request
from typing import Annotated
import os
from datetime import datetime
from utils.permission import require_permission
from utils.res import Result, PageResult, Page
from core.db import Base, get_db
from uuid import uuid4
from fastapi.responses import FileResponse

from models.knowlege_base import (
    FileLibraryInForm,
    FileLibraryUpdateForm,
    FileLibraryQueryForm,
    FileLibraryResponseModel,
    Files,
    FileContentTypeModel,
    UploadedFile,
    FileInformationModel
)

# 绝对路径前缀
BASE_FILE_DIR = r"D:\\Project\\YunWei\\back2\\AscentAI"
UPLOAD_DIR = r"upload_knowlege_database"
ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "text/plain",  
    "application/octet-stream",# txt

    "application/pdf",

    "application/msword",  # doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  # docx

    "application/vnd.ms-excel",  # xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",  # xlsx

    "application/vnd.ms-powerpoint",  # ppt
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",  # pptx
]

MAX_SIZE = 10 * 1024 * 1024  # 10MB

router = APIRouter()


@router.get("/information", response_model=Result[FileInformationModel], summary="获取文件信息")
async def get_file_information(
    current_user=Depends(require_permission("file:query"))
):
    """获取文件信息"""

    file_information = Files.get_file_information()

    if not file_information:
        return Result.error(msg="获取文件信息失败")
    return Result.success(file_information)


@router.get("/content_type", response_model=Result[list[FileContentTypeModel]], summary="获取文件内容类型列表")
async def get_file_content_type_list(
    current_user=Depends(require_permission("file:query"))
):
    """获取文件内容类型列表"""

    content_type_list = Files.get_file_type_name_list()

    if not content_type_list:
        return Result.error(msg="获取文件内容类型列表失败")

    return Result.success(content_type_list)

@router.post("/content_type", response_model=Result[str], summary="创建文件内容类型")
async def create_file_content_type(
    name: str = Query(..., description="文件内容类型名称"),
    current_user=Depends(require_permission("file:create"))
):
    """创建文件内容类型"""

    # 校验文件内容类型名称是否存在
    content_type_id = Files.get_file_type_id(name)
    if content_type_id:
        return Result.error(msg="文件内容类型名称已存在")

    db_obj = Files.create_file_content_type(name)

    if not db_obj:
        return Result.error(msg="文件内容类型创建失败")

    return Result.success(db_obj)

@router.delete("/content_type/{name}", response_model=Result[bool], summary="删除文件内容类型")
async def delete_file_content_type(
    name: str,
    current_user=Depends(require_permission("file:delete"))
):
    """删除文件内容类型"""
    success = Files.delete_file_content_type(name)

    if not success:
        return Result.error(msg="文件内容类型删除失败,没有该文件内容类型,或者存在该文件内容类型的文件")
    return Result.success(success)


@router.post("", response_model=Result[FileLibraryResponseModel], summary="上传文件")
async def upload_file(
    form: FileLibraryInForm= Depends(),
    file: UploadFile = File(...),
    current_user=Depends(require_permission("file:create"))
):
    """上传文件"""

    # 文件类型校验
    if file.content_type not in ALLOWED_TYPES:  
        return Result.error(msg=f"上传失败，仅支持 {', '.join(ALLOWED_TYPES)} 文件")
    
    # 校验文件内容类型是否存在
    content_type_id = Files.get_file_type_id(form.content_type_name)
    if not content_type_id:
        return Result.error(msg="上传失败，文件内容类型不存在")

    # 读取文件内容
    file_bytes = await file.read()
    size = len(file_bytes)

    if size > MAX_SIZE:
        return Result.error(msg="上传失败，文件不能超过 10MB")
    
    
    ext = os.path.splitext(file.filename)[1]
    unique_name = f"{form.filename}{ext}"
    #存储的相对路径（存数据库）
    relative_path = os.path.join(UPLOAD_DIR, unique_name)
    #实际保存文件的绝对路径
    abs_path = os.path.join(BASE_FILE_DIR, relative_path)
    # 创建上传目录
    os.makedirs(os.path.dirname(abs_path), exist_ok=True)
    # 正确提取上传文件的真实后缀
    
    # 写入文件
    with open(abs_path, "wb") as f:
        f.write(file_bytes)

    # 保存数据库记录
    new_data = {
        "filename": form.filename,
        "filepath": relative_path,
        "size": size,
        "mime_type": file.content_type,
        "author": form.author,
        "content_type_id": content_type_id
    }

    db_obj = Files.insert(**new_data)

    if not db_obj:
        return Result.error(msg="文件上传失败")

    return Result.success(FileLibraryResponseModel.model_validate(db_obj))


@router.get("/list", response_model=PageResult[FileLibraryResponseModel], summary="获取文件列表")
def list_files(
    query: Annotated[FileLibraryQueryForm, Query()],
    current_user=Depends(require_permission("file:query"))
):
    """获取文件列表"""
    data, total = Files.list_api(query)
    page_data = Page(total=total, list=data)
    return Result.success(page_data)

@router.get("/download/{id}", summary="下载/预览文件")
def download_file_by_id(
    id: int,
    current_user=Depends(require_permission("file:query"))
):
    """根据ID返回文件本体（浏览器自动预览或下载）"""

    # 获取数据库记录
    tag = Files.get_by_id(id)
    if not tag:
        return Result.error(msg="文件不存在")

    abs_path = os.path.join(BASE_FILE_DIR, tag.filepath)
    # 判断文件是否真实存在
    if not os.path.exists(abs_path):
        return Result.error(msg="文件本体不存在")
    # 更新文件访问次数
    Files.update_file_cnt(id)
    # 返回文件
    return FileResponse(
        path=abs_path,
        filename=tag.filename,         # 浏览器显示的文件名
        media_type=tag.mime_type or "application/octet-stream"
    )

@router.get("/{id}", response_model=Result[FileLibraryResponseModel], summary="根据ID获取文件信息")
def get_file_by_id(
    id: int,
    current_user=Depends(require_permission("file:query"))
):
    """根据ID获取文件"""
    tag = Files.get_by_id(id)
    if not tag:
        return Result.error(msg="文件不存在")
    return Result.success(tag)

@router.put("/{id}", response_model=Result[FileLibraryResponseModel], summary="更新文件记录")
def update_file(
    id: int,
    form: FileLibraryUpdateForm,
    current_user=Depends(require_permission("file:update"))
):
    # 1. 获取旧数据
    old = Files.get_by_id(id)
    if not old:
        return Result.error(msg="文件更新失败，文件ID不存在")

    if form.content_type_id is not None:
        # 校验文件内容类型是否存在
        content_type = Files.get_file_type_name_list()
        if not content_type:
            return Result.error(msg="文件更新失败，文件内容类型不存在")
        if form.content_type_id not in [ct.id for ct in content_type]:
            return Result.error(msg="文件更新失败，文件内容类型不存在")

    if form.filename is not None:
        # 校验文件名是否存在
        file_obj = Files.get_file_by_file_name(form.filename)
        if file_obj:
            return Result.error(msg="文件名已存在")

        old_path = old.filepath

        # 从 filepath 中提取真实后缀
        ext = os.path.splitext(old_path)[1]

        new_filename = f"{form.filename}{ext}"
        new_path = os.path.join(UPLOAD_DIR, new_filename)
        form.filepath = new_path
        old_abs_path = os.path.join(BASE_FILE_DIR, old_path)
        new_abs_path = os.path.join(BASE_FILE_DIR, new_path)
        # 重命名本地文件
        try:
            os.rename(old_abs_path, new_abs_path)
        except Exception as e:
            return Result.error(msg=f"文件重命名失败: {str(e)}")

    # 4. 更新数据库
    updated = Files.update_by_id(id, form)
    if not updated:
        return Result.error(msg="文件更新失败（数据库更新失败）")

    return Result.success(FileLibraryResponseModel.model_validate(updated))


@router.delete("/{id}", response_model=Result[bool], summary="删除文件")
def delete_file(
    id: int,
    current_user=Depends(require_permission("file:delete"))
):
    """删除文件"""

    with get_db() as db:
        file_obj = db.query(UploadedFile).filter(UploadedFile.id == id).first()
        if not file_obj:
            return Result.error(msg="文件删除失败，文件ID不存在")
        
        abs_path = os.path.join(BASE_FILE_DIR, file_obj.filepath)
        # 删除本地文件
        if os.path.exists(abs_path):
            os.remove(abs_path)

        # 删除数据库记录
        result = Files.delete_by_id(id)
        if not result:
            return Result.error(msg="文件删除失败")

    return Result.success()
