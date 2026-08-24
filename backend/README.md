# English Club GNDEC - Backend API Documentation

This is the backend server for the English Club application, built with **Node.js**, **Express**, and **Supabase**.

---

## 📁 Project Structure Analysis

- **`config/`**: Handles external service configurations.
    - `supabase.js`: Initializes the Supabase client using environment variables.
- **`controllers/`**: Logic layer. Interacts with Supabase and processes data.
- **`routes/`**: Route definitions using Express Router.
- **`database/`**: SQL files representing the current table structures in Supabase.
- **`app.js`**: Central application file where middleware and routes are configured.
- **`server.js`**: Starts the HTTP server.

---

## 🚀 Detailed API Documentation

### 1. User Management (`/api/user`)
Handles administrative users and club members.

#### **[GET] Fetch All Users**
- **Path:** `/:user_id/getUsers`
- **Description:** Retrieves a list of all registered users.
- **Path Parameters:** `user_id` (The ID of the requester).
- **Response (200 OK):**
  ```json
  [
    {
      "user_id": 1,
      "member_id": "uuid-here",
      "user_name": "jasdeep_singh",
      "user_role": "MASTER",
      "created_at": "...",
      "updated_at": "..."
    }
  ]
  ```

#### **[GET] Fetch User by ID**
- **Path:** `/:user_id`
- **Description:** Returns profile information for a specific user.
- **Path Parameters:** `user_id` (The ID of the user to fetch).
- **Response (200 OK):** User profile object.
- **Error (404):** `{ "error": "User not found" }`

#### **[POST] Create New User**
- **Path:** `/:user_id/createUser`
- **Description:** Registers a new admin/manager. Passwords are hashed with Bcrypt.
- **Request Body:**
    - `user_name` (String, Required)
    - `user_password` (String, Required)
    - `user_role` (Enum: MASTER, ADMIN, MANAGER, Required)
    - `member_id` (UUID, Required - links to a member record)
- **Response (201 Created):** `{ "message": "User created successfully", "user": { ... } }`

#### **[PATCH] Update User Profile**
- **Path:** `/:user_id/updateUser`
- **Description:** Allows updating user account details.
- **Request Body:** `user_name`, `user_password`.
- **Response (200 OK):** `{ "message": "User details updated successfully", "user": { ... } }`

#### **[GET] Get User and Member by Member ID**
- **Path:** `/:member_id/getUserByMemberId`
- **Description:** Returns both user and member profile information joined together.
- **Path Parameters:** `member_id` (The ID of the member).
- **Response (200 OK):** Combined User and Member object (excluding password).

---

### 2. Event Management (`/api/events`)
Handles the lifecycle of club events.

#### **[POST] Create Event**
- **Path:** `/createEvent`
- **Description:** Records a new upcoming event.
- **Request Body:**
    - `event_name` (String, Required)
    - `event_description` (String, Required)
    - `event_venue` (String, Optional)
    - `event_date` (Date YYYY-MM-DD, Optional)
    - `event_time` (Time HH:MM:SS, Optional)
    - `event_poster_key` (String, Optional)
    - `created_by` (Number - user_id, Required)
- **Response (201 Created):** Includes the event data and the `creater_name`.

#### **[GET] Get All Events**
- **Path:** `/getAllEvents`
- **Description:** Lists all events sorted by date.
- **Response (200 OK):** Array of event objects with creator names.

#### **[GET] Get Event by ID**
- **Path:** `/:event_id`
- **Description:** Fetches full details for a single event.
- **Response (200 OK):** Event object.

#### **[PATCH] Update Event**
- **Path:** `/:event_id/updateEvent`
- **Description:** Modifies existing event details. Automatically refreshes the `updated_at` timestamp.
- **Request Body:** (Optional) `event_name`, `event_description`, `event_venue`, `event_date`, `event_time`.
- **Response (200 OK):** `{ "message": "Event updated successfully", "event": { ... } }`

---

### 3. Registration & Participants (`/api/registration`)
Manages student registrations for specific events.

#### **[POST] Register Participant**
- **Path:** `/register`
- **Description:** Creates a registration for a student. Uses UUIDs for participant IDs to ensure uniqueness across the system.
- **Request Body:**
    - `participant_name` (String, Required)
    - `participant_class` (String, Required)
    - `participant_crn` (Number, Required)
    - `participant_urn` (Number, Optional)
    - `participant_email` (String, Required)
    - `registered_event` (Number - event_id, Required)
- **Response (201 Created):** `{ "message": "Participant registered successfully", "participant": { ... } }`

#### **[GET] Get All Participants**
- **Path:** `/getAllParticipants`
- **Description:** Returns a master list of all registrations in the database.
- **Response (200 OK):** Array of participant objects with their `event_name`.

#### **[GET] Get Participants by Event**
- **Path:** `/:event_id/getParticipantsByEventId`
- **Description:** Filters participants based on the event they registered for.
- **Path Parameters:** `event_id` (The ID of the event).
- **Response (200 OK):** Array of participant objects.

#### **[GET] Get Participation Count**
- **Path:** `/:event_id/getParticipationCountByEventId`
- **Description:** A lightweight API to get just the total number of registrations for an event.
- **Path Parameters:** `event_id` (The ID of the event).
- **Response (200 OK):** `{ "event_id": "...", "total_participants": 25 }`

#### **[PATCH] Update Participant**
- **Path:** `/:participant_id/updateParticipant`
- **Description:** Updates participant details (e.g., email correction or class change).
- **Request Body:** Any participant field.
- **Response (200 OK):** `{ "message": "Participant updated successfully", "participant": { ... } }`

---

### 4. Member Management (`/api/members`)
Handles the detailed records of English Club members.

#### **[POST] Create Member**
- **Path:** `/:user_id/createMember`
- **Description:** Adds a new member to the database.
- **Request Body:**
    - `member_name` (Required)
    - `member_postion` (Enum: CONVENOR, CO-CONVENOR, TECHNICAL_HEAD, CO-TECHNICAL_HEAD, CREATIVE_HEAD, CO-CREATIVE_HEAD, EVENT_MANAGEMENT_HEAD, CO-EVENT_MANAGEMENT_HEAD, FINANCE_&_MARKET_RELATIONS_HEAD, CO-FINANCE_&_MARKET_RELATIONS_HEAD, CREATIVE_&_PHOTOGRAPHY_HEAD, CO-CREATIVE_&_PHOTOGRAPHY_HEAD, PROMOTION_HEAD, CO-PROMOTION_HEAD, ANCHORING_HEAD, CO-ANCHORING_HEAD, EXECUTIVE_MEMBER, ACTIVE_MEMBER, Required)
    - `member_urn` (Long, Required)
    - `member_email` (Required)
    - `member_department` (Enum: IT, CSE, etc., Required)
    - `member_semester` (Integer 1-8, Required)
    - `member_profile_picture_key` (String)
    - `member_crn` (Long)
    - `member_club_department` (String: TECHNICAL, EVENT_MANAGEMENT, FINANCE_&_MARKET_RELATIONS, CREATIVE_&_PHOTOGRAPHY, PROMOTION, ANCHORING, ALL)
    - `socials` (JSON Object: `{ "linkedin": "...", "github": "..." }`)
    - `created_by` (BIGINT - user_id, Required)
- **Response (201 Created):** Member object.

#### **[GET] Get All Members**
- **Path:** `/getAllMembers`
- **Description:** Lists all club members.
- **Response (200 OK):** Array of member objects.

#### **[GET] Get Member by ID**
- **Path:** `/:user_id/:member_id/getMemberById`
- **Description:** Fetches full details for a single member.
- **Response (200 OK):** Member object.

#### **[PATCH] Update Member**
- **Path:** `/:user_id/:member_id/updateMemberById`
- **Description:** Modifies member details.
- **Request Body:** Any member field.
- **Response (200 OK):** `{ "message": "Member updated successfully", "member": { ... } }`

#### **[DELETE] Delete Members**
- **Path:** `/:user_id/deleteMembersById`
- **Description:** Deletes multiple members at once.
- **Request Body:** `{ "member_ids": ["uuid1", "uuid2"] }`
- **Response (200 OK):** `{ "message": "2 member(s) deleted successfully" }`

---

### 5. Recruitment Management (`/api/recruitment`)
Handles the recruitment process for new club members.

#### **[POST] Create Candidate**
- **Path:** `/createCandidate`
- **Description:** Submits a new candidate application.
- **Request Body:**
    - `candidate_name` (String, Required)
    - `candidate_class` (String, Required)
    - `candidate_crn` (Number/Long, Required)
    - `candidate_urn` (Number/Long, Optional)
    - `candidate_email` (String, Required)
    - `interested_department` (Enum: TECHNICAL, CREATIVE, EVENT_MANAGEMENT, FINANCE_&_MARKET_RELATIONS, CREATIVE_&_PHOTOGRAPHY, PROMOTION, ANCHORING, Required)
- **Response (201 Created):** Candidate object.

#### **[GET] Fetch All Candidates**
- **Path:** `/:user_id/getAllCandidates`
- **Description:** Retrieves all candidate applications.
- **Response (200 OK):** Array of candidate objects.

#### **[GET] Fetch Candidate by ID**
- **Path:** `/:userId/:candidate_id/getCandidateById`
- **Description:** Returns details for a specific candidate.
- **Response (200 OK):** Candidate object.

#### **[PATCH] Update Candidate Info**
- **Path:** `/:candidate_id/updateCandidateById`
- **Description:** Updates candidate details (name, class, etc.).
- **Response (200 OK):** Updated candidate object.

#### **[PATCH] Update Candidate Status**
- **Path:** `/:user_id/:candidate_key/updateCandidateStatusById`
- **Description:** Updates the status of a candidate and tracks who made the change.
- **Request Body:**
    - `candidate_status` (Enum: PENDING, IN_REVIEW, PRESENT, SELECTED, REJECTED)
    - `status_updated_by` (Number - user_id)
- **Response (200 OK):** Updated candidate object.

#### **[DELETE] Archive All Data**
- **Path:** `/:user_id/archiveAllData`
- **Description:** Moves all current candidates to recruitment history and clears the candidates table.
- **Request Body:**
    - `recruitment_date` (Date YYYY-MM-DD, Required)
- **Response (200 OK):** `{ "message": "All recruitment data archived...", "archivedCount": 10 }`

---

### 6. Blog Submission Management (`/api/submission`)
Handles student blog post contributions, moderation, resubmission, and daily data pruning.

#### **[POST] Submit New Blog**
- **Path:** `/`
- **Description:** Submits a new blog post. Default status is set to `PENDING`.
- **Request Body:**
    - `student_name` (String, Required)
    - `student_class` (String, Required)
    - `student_urn` (Number/Long, Required)
    - `student_crn` (Number/Long, Optional)
    - `student_email` (String, Required)
    - `title` (String, Required)
    - `description` (String, Required)
    - `body` (String, HTML/Markdown content, Required)
    - `image_url` (String, Cover Image URL, Optional)
    - `tags` (Array of Strings, Optional)
- **Response (201 Created):** Includes the submission details and a unique `edit_token`.

#### **[GET] Fetch All Submissions**
- **Path:** `/`
- **Description:** Retrieves all submissions sorted by creation date. (Admin use).
- **Response (200 OK):** Array of all submission records.

#### **[GET] Fetch Approved Submissions**
- **Path:** `/approved`
- **Description:** Retrieves only `APPROVED` posts to display on the public blog feed.
- **Response (200 OK):** Array of approved submission records.

#### **[PATCH] Update Moderation Status**
- **Path:** `/:submissionId/:userId`
- **Description:** Allows administrators to approve, reject, or delete submissions. Sets `reviewed_by` to the provided `userId`.
- **Path Parameters:**
    - `submissionId` (UUID of the submission)
    - `userId` (ID of the admin making the review)
- **Request Body:**
    - `status` (Enum: PENDING, APPROVED, REJECTED, DELETED, Required)
    - `rejection_reason` (String, Required if status is REJECTED)
    - `edit_token` (UUID, Optional)
- **Response (200 OK):** Updated submission object.

#### **[PATCH] Edit and Resubmit**
- **Path:** `/:submissionId/:edit_token`
- **Description:** Allows students to correct and resubmit rejected blog posts. Automatically resets status to `PENDING` and clears all review/rejection metadata.
- **Path Parameters:**
    - `submissionId` (UUID of the submission)
    - `edit_token` (UUID secure key received upon submission)
- **Request Body:** Same fields as **Submit New Blog**.
- **Response (200 OK):** Updated submission object.

#### **[DELETE] Delete Submission**
- **Path:** `/:submissionId`
- **Description:** Permanently deletes a submission record.
- **Response (200 OK):** `{ "message": "Submission deleted successfully", "deletedCount": 1 }`

#### **[POST] Daily Expired Cleanup**
- **Path:** `/cleanup`
- **Description:** Background endpoint triggered by cron job to permanently purge rejected submissions older than 7 days and delete their referenced Supabase Storage images.
- **Headers:** `Authorization: Bearer <cleanup_secret_key>`
- **Response (200 OK):** Summary of purged records and assets.

---

## 🛠 Tech Stack Details
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Password hashing with `bcrypt`.
- **Unique Identifiers:** `BIGSERIAL` for events/users, `UUID` for members/participants.
- **Time Management:** Automatic `updated_at` triggers on all tables.
