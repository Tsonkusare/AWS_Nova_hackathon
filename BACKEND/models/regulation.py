from sqlalchemy import Column, Integer, String, Text, ForeignKey, Date
from sqlalchemy.orm import relationship

from models.base import Base


class Country(Base):
    __tablename__ = "country"

    jurisdiction_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=True)

    regulations = relationship("Regulation", back_populates="country")


class Regulation(Base):
    __tablename__ = "regulations"

    reg_id = Column(Integer, primary_key=True, index=True)
    jurisdiction_id = Column(
        Integer,
        ForeignKey("country.jurisdiction_id"),
        nullable=True
    )
    title = Column(String(500), nullable=False)
    year = Column(Integer, nullable=True)
    effective_date = Column(Date, nullable=True)
    status = Column(String(50), nullable=True)

    country = relationship("Country", back_populates="regulations")
    sections = relationship(
        "Section",
        back_populates="regulation",
        cascade="all, delete-orphan"
    )


class Section(Base):
    __tablename__ = "sections"

    section_id = Column(Integer, primary_key=True, index=True)
    reg_id = Column(
        Integer,
        ForeignKey("regulations.reg_id", ondelete="CASCADE"),
        nullable=False
    )
    section_number = Column(String(50), nullable=True)
    section_title = Column(String(500), nullable=True)

    regulation = relationship("Regulation", back_populates="sections")
    texts = relationship(
        "SectionText",
        back_populates="section",
        cascade="all, delete-orphan"
    )


class SectionText(Base):
    __tablename__ = "section_text"

    text_id = Column(Integer, primary_key=True, index=True)
    section_id = Column(
        Integer,
        ForeignKey("sections.section_id", ondelete="CASCADE"),
        nullable=False
    )
    language = Column(String(20), nullable=True)
    text = Column(Text, nullable=True)

    section = relationship("Section", back_populates="texts")