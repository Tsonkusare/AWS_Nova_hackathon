CREATE TABLE country (
    jurisdiction_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50)
);

CREATE TABLE regulations (
    reg_id SERIAL PRIMARY KEY,
    jurisdiction_id INT REFERENCES country(jurisdiction_id),
    title VARCHAR(500) NOT NULL,
    year INT,
    effective_date DATE,
    status VARCHAR(50)
);

CREATE TABLE sections (
    section_id SERIAL PRIMARY KEY,
    reg_id INT REFERENCES regulations(reg_id) ON DELETE CASCADE,
    section_number VARCHAR(50),
    section_title VARCHAR(500)
);

CREATE TABLE section_text (
    text_id SERIAL PRIMARY KEY,
    section_id INT REFERENCES sections(section_id) ON DELETE CASCADE,
    language VARCHAR(20),
    text TEXT
);

CREATE TABLE topics (
    topic_id SERIAL PRIMARY KEY,
    topic_name VARCHAR(255) UNIQUE
);

CREATE TABLE regulation_topics (
    reg_id INT REFERENCES regulations(reg_id) ON DELETE CASCADE,
    topic_id INT REFERENCES topics(topic_id) ON DELETE CASCADE,
    PRIMARY KEY (reg_id, topic_id)
);

CREATE TABLE definitions (
    definition_id SERIAL PRIMARY KEY,
    reg_id INT REFERENCES regulations(reg_id) ON DELETE CASCADE,
    term VARCHAR(255),
    definition_text TEXT
);

CREATE TABLE regulation_references (
    reg_id INT REFERENCES regulations(reg_id) ON DELETE CASCADE,
    referenced_reg_id INT REFERENCES regulations(reg_id),
    PRIMARY KEY (reg_id, referenced_reg_id)
);