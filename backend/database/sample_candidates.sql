-- SQL Script to Seed Sample Candidates into the `candidates` Table
-- Run this in Supabase SQL Editor or your PostgreSQL database

INSERT INTO candidates (
    candidate_name,
    candidate_class,
    candidate_crn,
    candidate_urn,
    candidate_email,
    interested_department,
    candidate_description,
    candidate_why_eligible,
    candidate_status,
    candidate_comment,
    custom_answers
) VALUES
-- Technical Department
('Aarav Sharma', 'D2IT-A', 2204101, 2204201, 'aarav.sharma@gndec.ac.in', 'TECHNICAL', 'Passionate full-stack developer and open source enthusiast.', 'I have experience organizing tech workshops and website maintenance.', 'SELECTED', 'Strong technical skills and enthusiastic attitude.', '{}'::jsonb),
('Priya Patel', 'D3CSE-B', 2105104, 2105204, 'priya.patel@gndec.ac.in', 'TECHNICAL', 'Frontend developer skilled in React, Tailwind, and Web animation.', 'Want to lead English Club''s web platform development.', 'SELECTED', 'Excellent web development skills.', '{}'::jsonb),

-- Creative Department
('Ananya Roy', 'D2ECE-A', 2206105, 2206205, 'ananya.roy@gndec.ac.in', 'CREATIVE', 'Content writer, blogger, and creative graphics designer.', 'I write articles for college newsletter and design event posters.', 'SELECTED', 'Great portfolio of articles and graphic designs.', '{}'::jsonb),
('Rohan Gupta', 'D1IT-B', 2304112, 2304212, 'rohan.gupta@gndec.ac.in', 'CREATIVE', 'Passionate about literature, poetry, and creative copy writing.', 'Eager to contribute fresh creative ideas to English Club.', 'SELECTED', 'Selected for Creative writing team.', '{}'::jsonb),

-- Promotion Department
('Ishita Verma', 'D2BBA-A', 2208103, 2208203, 'ishita.verma@gndec.ac.in', 'PROMOTION', 'Social media manager and digital marketing enthusiast.', 'Experienced in managing Instagram pages and public relations.', 'SELECTED', 'Exceptional outreach skills.', '{}'::jsonb),
('Harpreet Singh', 'D3ME-A', 2107108, 2107208, 'harpreet.singh@gndec.ac.in', 'PROMOTION', 'Public relations specialist and campus outreach strategist.', 'Good at campaign execution and student engagement.', 'SELECTED', 'Approved for Promotions team.', '{}'::jsonb),

-- Event Management Department
('Simran Kaur', 'D2CSE-A', 2205115, 2205215, 'simran.kaur@gndec.ac.in', 'EVENT_MANAGEMENT', 'Event coordinator with leadership and logistics management skills.', 'Organized major department fests and inter-college competitions.', 'SELECTED', 'Strong leadership and management record.', '{}'::jsonb),
('Kabir Mehta', 'D1RAI-A', 2309102, 2309202, 'kabir.mehta@gndec.ac.in', 'EVENT_MANAGEMENT', 'Detail-oriented event manager and team player.', 'Passionate about hosting smooth events.', 'SELECTED', 'Promising event team member.', '{}'::jsonb),

-- Discipline Department
('Gurinder Singh', 'D3CE-B', 2103120, 2103220, 'gurinder.singh@gndec.ac.in', 'DISICIPLINE', 'Disciplined team leader focused on smooth crowd control.', 'Active member in college discipline committee.', 'SELECTED', 'Reliable and punctual.', '{}'::jsonb),

-- Photography & Videography Department
('Rahul Malhotra', 'D2IT-B', 2204130, 2204230, 'rahul.malhotra@gndec.ac.in', 'PHOTOGRAPHY_VIDEOGRAPHY', 'Videographer, reel editor, and photographer.', 'Equipped with DSLR camera and Premiere Pro skills.', 'SELECTED', 'Great photography showcase.', '{}'::jsonb),
('Sneha Reddy', 'D1BCA-A', 2310105, 2310205, 'sneha.reddy@gndec.ac.in', 'PHOTOGRAPHY', 'Portrait photographer and photo retouching specialist.', 'High quality photography samples submitted.', 'SELECTED', 'Selected for Photography team.', '{}'::jsonb),

-- Database Department
('Aditya Joshi', 'D3CSE-A', 2105150, 2105250, 'aditya.joshi@gndec.ac.in', 'DATABASE', 'SQL and database administrator.', 'Maintains records cleanly and handles registration data.', 'SELECTED', 'Excellent data entry and management skills.', '{}'::jsonb),

-- Anchoring Department
('Mehak Kapoor', 'D2EE-A', 2202108, 2202208, 'mehak.kapoor@gndec.ac.in', 'ANCHORING', 'Stage anchor, public speaker, and debate champion.', 'Hosted stage shows and national level debates.', 'SELECTED', 'Outstanding vocal clarity and stage presence.', '{}'::jsonb),
('Jaspreet Kaur', 'D1IT-A', 2304118, 2304218, 'jaspreet.kaur@gndec.ac.in', 'ANCHORING', 'Fluent speaker and podcast host.', 'Confident communicator with great articulation.', 'SELECTED', 'Inducted into Anchoring team.', '{}'::jsonb),

-- Pending Candidate Example
('Vikramjit Singh', 'D1CSE-C', 2305199, 2305299, 'vikramjit.singh@gndec.ac.in', 'TECHNICAL', 'Learning web development and python scripting.', 'Enthusiastic beginner eager to learn.', 'PENDING', 'Under review.', '{}'::jsonb);
