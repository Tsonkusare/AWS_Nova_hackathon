from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from models.base import Base


class Regulation(Base):
    __tablename__ = "regulations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    region = Column(String, nullable=True)
    description = Column(Text, nullable=True)

    sections = relationship(
        "RegulationSection",
        back_populates="regulation",
        cascade="all, delete-orphan"
    )


class RegulationSection(Base):
    __tablename__ = "regulation_sections"

    id = Column(Integer, primary_key=True, index=True)
    regulation_id = Column(Integer, ForeignKey("regulations.id", ondelete="CASCADE"), nullable=False)
    section_code = Column(String, nullable=True)
    title = Column(String, nullable=True)
    text = Column(Text, nullable=False)

    regulation = relationship("Regulation", back_populates="sections")
    requirements = relationship(
        "ComplianceRequirement",
        back_populates="section",
        cascade="all, delete-orphan"
    )


class ComplianceRequirement(Base):
    __tablename__ = "compliance_requirements"

    id = Column(Integer, primary_key=True, index=True)
    regulation_section_id = Column(Integer, ForeignKey("regulation_sections.id", ondelete="CASCADE"), nullable=False)
    requirement_text = Column(Text, nullable=False)
    risk_level = Column(String, nullable=True)
    category = Column(String, nullable=True)

    section = relationship("RegulationSection", back_populates="requirements")