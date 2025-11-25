from ast import Str
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from core.db import Base, get_db
from models.crud import BaseCRUD
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import func
from datetime import date


class FileContentType(Base):
    __tablename__ = "file_content_type"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False, comment="文件内容类型名称")


class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False, comment="文件名")
    filepath = Column(String(500), nullable=False, comment="服务器本地路径")
    size = Column(Integer, nullable=False, comment="文件大小（字节）")
    mime_type = Column(String(50), nullable=False, comment="文件类型")
    author = Column(String(50), nullable=False, comment="上传作者")
    abstract = Column(String(4000), nullable=False, comment="文件摘要")
    cnt = Column(Integer, nullable=False, comment="文件被访问次数")
    create_time = Column(DateTime, default=datetime.now, comment="创建时间")
    update_time = Column(DateTime, default=datetime.now, onupdate=datetime.now, comment="更新时间")

    content_type_id = Column(Integer, ForeignKey("file_content_type.id"), nullable=False)
    content_type = relationship("FileContentType")


class FileInformationModel(BaseModel):
    model_config =ConfigDict(from_attributes=True)
    FileCnt: int = 0 #文件总数
    today_cnt: int = 0 #今日新增
    read_cnt: int = 0 #总访问次数

class FileContentTypeModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int | None = None
    name: str

class FileLibraryModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int | None = None
    filename: str
    filepath: str
    size: int
    mime_type: str
    abstract: str | None = None
    cnt: int = 0
    author: str
    create_time: datetime
    update_time: datetime
    content_type_id: int


class FileLibraryInForm(BaseModel):
    filename: str = Field(..., description="文件名")
    content_type_name:str = Field(..., description="文件内容类型名称")
    author: str = Field(..., description="上传作者")
    abstract: str = Field(..., description="文件摘要")



class FileLibraryUpdateForm(BaseModel):
    filename: str | None = None
    content_type_id: int | None = None
    filepath: str | None = None
    abstract: str | None = None


class FileLibraryQueryForm(BaseModel):
    content_type_name: str | None = None
    page: int = 1
    page_size: int = 100


class FileLibraryResponseModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    filepath: str
    size: int
    mime_type: str
    abstract: str | None = None
    cnt: int = 0
    author: str
    create_time: datetime
    update_time: datetime
    content_type_id: int


class FileLibraryTable(BaseCRUD[UploadedFile, FileLibraryModel, FileLibraryUpdateForm]):
    db_model = UploadedFile
    pydantic_model = FileLibraryModel
    
    def get_file_information(self) -> FileInformationModel | None:
        """获取文件信息"""
        with get_db() as db:
            # 文件总数
            FileCnt = db.query(func.count(UploadedFile.id)).scalar() or 0

            # 今日日期范围
            today = date.today()
            today_start = datetime.combine(today, datetime.min.time())
            today_end = datetime.combine(today, datetime.max.time())

            # 今日新增
            today_cnt = (
                db.query(func.count(UploadedFile.id))
                .filter(UploadedFile.create_time >= today_start)
                .filter(UploadedFile.create_time <= today_end)
                .scalar()
                or 0
            )

            # 阅读总数 (cnt 累加)
            read_cnt = db.query(func.sum(UploadedFile.cnt)).scalar() or 0

            file_information = FileInformationModel(
                FileCnt=FileCnt,
                today_cnt=today_cnt,
                read_cnt=read_cnt
            )
            if not file_information:
                return None
            return file_information

    def list_api(self, query: FileLibraryQueryForm = None) -> tuple[list[FileLibraryResponseModel], int]:
        """获取文件信息列表"""
        with get_db() as db:
            q = db.query(UploadedFile)

            if query:
                if query.content_type_name:
                    q = q.filter(UploadedFile.content_type.has(FileContentType.name.like(f"%{query.content_type_name}%")))

            total = q.count()

            if query:
                q = q.offset((query.page - 1) * query.page_size).limit(query.page_size)

            files = q.all()
            if not files:
                return [], 0

            return [FileLibraryResponseModel.model_validate(file) for file in files], total

    def get_file_by_name(self, name: str) -> FileLibraryResponseModel | None:
        """根据文件内容类型名称获取文件信息"""
        with get_db() as db:
            file = db.query(UploadedFile).filter(UploadedFile.content_type.has(FileContentType.name == name)).first()
            if not file:
                return None
            return FileLibraryResponseModel.model_validate(file)
    
    def get_file_by_file_name(self, name: str) -> FileLibraryResponseModel | None:
        """根据文件名获取文件信息"""
        with get_db() as db:
            file = db.query(UploadedFile).filter(UploadedFile.filename == name).first()
            if not file:
                return None
            return FileLibraryResponseModel.model_validate(file)
    
    def update_file_cnt(self, id: int) -> bool:
        """更新文件访问次数"""
        with get_db() as db:
            file = db.query(UploadedFile).filter(UploadedFile.id == id).first()
            if not file:
                return False
            file.cnt = file.cnt + 1
            
            print("update_file_cnt called!!!")
            db.commit()
            db.refresh(file)
            return True

    def get_file_type_name_list(self) -> list[FileContentTypeModel] | None:
        """获取文件内容类型名称列表"""
        with get_db() as db:
            content_types = db.query(FileContentType).all()
            if not content_types:
                return None
            return [FileContentTypeModel.model_validate(content_type) for content_type in content_types]
    
    def get_file_type_id(self, name: str) -> int | None:
        """根据文件内容类型名称获取文件内容类型ID"""
        with get_db() as db:
            content_type = db.query(FileContentType).filter(FileContentType.name == name).first()
            if not content_type:
                return None
            return content_type.id
    
    def create_file_content_type(self, name: str) -> str:
        """创建文件内容类型"""
        with get_db() as db:
            content_type = FileContentType(name=name)
            db.add(content_type)
            db.commit()
            db.refresh(content_type)
            return content_type.name
    
    def delete_file_content_type(self, name: str) -> bool:
        """删除文件内容类型"""
        #校验是否存在是该文件内容类型的文件
        with get_db() as db:
            file = db.query(UploadedFile).filter(UploadedFile.content_type.has(FileContentType.name == name)).first()
            if file:
                return False
            content_type = db.query(FileContentType).filter(FileContentType.name == name).first()
            if not content_type:
                return False
            db.delete(content_type)
            db.commit()
            return True

    

Files = FileLibraryTable()
