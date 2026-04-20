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
- **Description:** Retrieves a list of all registered users. Useful for admin dashboards to see the team.
- **Path Parameters:** `user_id` (The ID of the person making the request).
- **Response (200 OK):**
  ```json
  [
    {
      "user_id": 1,
      "user_name": "John Doe",
      "user_role": "MASTER",
      "user_image_key": "...",
      "linkedin": "...",
      "github": "...",
      "instagram": "...",
      "portfolio": "..."
    }
  ]
  ```

#### **[GET] Fetch User by ID**
- **Path:** `/:user_id`
- **Description:** Returns profile information for a specific user. Password and internal ID fields are excluded for security.
- **Path Parameters:** `user_id` (The ID of the user to fetch).
- **Response (200 OK):** User profile object.
- **Error (404):** `{ "error": "User not found" }`

#### **[POST] Create New User**
- **Path:** `/:user_id/createUser`
- **Description:** Registers a new user/admin into the system. Passwords are encrypted using Bcrypt before storage.
- **Request Body:**
    - `user_name` (String, Required)
    - `user_password` (String, Required)
    - `user_role` (Enum: MASTER, ADMIN, MANAGER, Required)
    - `user_image_key` (String, Optional)
    - `linkedin`, `github`, `instagram`, `portfolio` (Strings, Optional)
- **Response (201 Created):** `{ "message": "User created successfully", "user": { ... } }`

#### **[PATCH] Update User Profile**
- **Path:** `/:user_id/updateUser`
- **Description:** Allows a user to update their own profile information. Restricted from changing roles or passwords via this specific endpoint.
- **Request Body:** Any profile field except `user_id`, `user_role`, or `password`.
- **Response (200 OK):** `{ "message": "User details updated successfully", "user": { ... } }`

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
- **Response (200 OK):** Array of participant objects.

#### **[GET] Get Participation Count**
- **Path:** `/:event_id/getParticipationCountByEventId`
- **Description:** A lightweight API to get just the total number of registrations for an event.
- **Response (200 OK):** `{ "event_id": "...", "total_participants": 25 }`

#### **[PATCH] Update Participant**
- **Path:** `/:participant_id/updateParticipant`
- **Description:** Updates participant details (e.g., email correction or class change).
- **Request Body:** Any participant field.
- **Response (200 OK):** `{ "message": "Participant updated successfully", "participant": { ... } }`

---

## 🛠 Tech Stack Details
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Password hashing with `bcrypt`.
- **Unique Identifiers:** `BIGSERIAL` for events/users, `UUID` for participants.
- **Time Management:** Automatic `updated_at` triggers on all tables.
