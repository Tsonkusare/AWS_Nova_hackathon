--                                      
-- 1. COuntry (country, union, state)
--                                      
CREATE TABLE Country (
    jurisdiction_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) -- country, union, state, region
);

--                                      
-- 2. Regulations (laws)
--                                      
CREATE TABLE regulations (
    reg_id SERIAL PRIMARY KEY,
    jurisdiction_id INT REFERENCES Country(jurisdiction_id),
    title VARCHAR(500) NOT NULL,
    year INT,
    effective_date DATE,
    status VARCHAR(50) -- active, draft, repealed
);


-- 3. Sections / Articles of a law
--                                      
CREATE TABLE sections (
    section_id SERIAL PRIMARY KEY,
    reg_id INT REFERENCES regulations(reg_id) ON DELETE CASCADE,
    section_number VARCHAR(50),  -- Article 1, Section 5, etc
    section_title VARCHAR(500)
);

--                                      
-- 4. Text of each section (multilingual)
--                                      
CREATE TABLE section_text (
    text_id SERIAL PRIMARY KEY,
    section_id INT REFERENCES sections(section_id) ON DELETE CASCADE,
    language VARCHAR(20), -- en, fr, de, etc
    text LONGTEXT
);

	

--                                      
-- 5. Topics / tags (AI risk, biometric, etc)
--                                      
CREATE TABLE topics (
    topic_id SERIAL PRIMARY KEY,
    topic_name VARCHAR(255) UNIQUE
);

--                                      
-- 6. Regulation-topic mapping
--                                      
CREATE TABLE regulation_topics (
    reg_id INT REFERENCES regulations(reg_id) ON DELETE CASCADE,
    topic_id INT REFERENCES topics(topic_id) ON DELETE CASCADE,
    PRIMARY KEY (reg_id, topic_id)
);

--                                      
-- 7. Definitions (legal definitions)
--                                      
CREATE TABLE definitions (
    definition_id SERIAL PRIMARY KEY,
    reg_id INT REFERENCES regulations(reg_id) ON DELETE CASCADE,
    term VARCHAR(255),
    definition_text TEXT
);

--                                      
-- 8. Regulation references (law citing another law)
--                                      
CREATE TABLE regulation_references (
    reg_id INT REFERENCES regulations(reg_id) ON DELETE CASCADE,
    referenced_reg_id INT REFERENCES regulations(reg_id),
    PRIMARY KEY (reg_id, referenced_reg_id)
);

--                                      
-- 9. Section embeddings (for vector search)
--                                      
CREATE TABLE section_embeddings (
    label VARCHAR(255) PRIMARY KEY,
    embedding JSON
);