from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import or_ # Keep this import, it's correct and needed
import os

# Initialize Flask app, telling it where to find static files (your frontend)
# This assumes your 'frontend' folder is at the same level as your 'app.py'
app = Flask(__name__, static_folder='frontend')

# Configuration for Flask-SQLAlchemy and PostgreSQL
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://csc_student:11greatlaawS@localhost:5432/csc_materials_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False 

db = SQLAlchemy(app)

# Ensure database tables are created when the app starts
# This block should be run once, typically during deployment or initial setup.
# Running it on every app start is fine for development but less common in production.
with app.app_context():
    db.create_all()

# --- Define Your Database Model ---
class LectureMaterial(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    course_code = db.Column(db.String(50), nullable=False)
    level = db.Column(db.String(50), nullable=False)
    semester = db.Column(db.String(50), nullable=False)
    file_name = db.Column(db.String(255), nullable=False, unique=True) # Ensure unique for file management
    file_path = db.Column(db.String(255), nullable=False, unique=True) # Ensure unique for file management

    def __repr__(self):
        return f'<LectureMaterial {self.course_code} - {self.title}>'

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'course_code': self.course_code,
            'level': self.level,
            'semester': self.semester,
            'file_name': self.file_name # Frontend needs filename to request download
            # 'file_path' is not sent to frontend for security
        }

# --- Setup a folder for storing lecture files ---
# Define UPLOAD_FOLDER relative to the app.py location
UPLOAD_FOLDER = os.path.join(app.root_path, 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True) # Ensure the directory exists

# --- CORS Headers (Crucial for frontend fetching from a different port/origin) ---
# When you open index.html directly from your file system (file://...),
# the origin is 'null' or the file system itself. Your Flask app is on http://127.0.0.1:5000.
# For local development, allowing all origins ('*') is simplest, but for production,
# you'd replace '*' with your actual frontend domain (e.g., 'https://yourfrontend.com').
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*' # Allow all origins for local testing
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, DELETE'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

# --- API Endpoints ---

# ... (rest of your imports and setup) ...

# 1. Endpoint to get all lecture materials (with search, filter, and initial limit)
@app.route('/materials', methods=['GET'])
def get_materials():
    search_term = request.args.get('search', '').strip()
    level_filter_val = request.args.get('level', '').strip()
    semester_filter_val = request.args.get('semester', '').strip()

    # NEW: Get limit and offset from request arguments
    # If limit is not provided (e.g., during a search/filter), it defaults to None (no limit)
    # If provided, convert to int. Initial page load might send a limit.
    limit = request.args.get('limit', type=int)
    # offset = request.args.get('offset', type=int) # Not strictly needed for this current approach, but good to keep in mind for full pagination

    query = LectureMaterial.query

    # Define mappings for frontend dropdown values to database values
    level_map = {
        '1': '100 Level',
        '2': '200 Level',
        '3': '300 Level',
        '4': '400 Level'
    }
    semester_map = {
        '1': 'Harmattan Semester',
        '2': 'Rain Semester'
    }

    # Apply search filter if search_term is provided
    if search_term:
        # Case-insensitive search across multiple fields
        query = query.filter(
            or_(
                LectureMaterial.title.ilike(f'%{search_term}%'),
                LectureMaterial.course_code.ilike(f'%{search_term}%'),
                LectureMaterial.level.ilike(f'%{search_term}%'),
                LectureMaterial.semester.ilike(f'%{search_term}%'),
                LectureMaterial.file_name.ilike(f'%{search_term}%')
            )
        )
    
    # Apply level filter if provided, using the mapping
    if level_filter_val:
        mapped_level = level_map.get(level_filter_val)
        if mapped_level:
            query = query.filter_by(level=mapped_level)

    # Apply semester filter if provided, using the mapping
    if semester_filter_val:
        mapped_semester = semester_map.get(semester_filter_val)
        if mapped_semester:
            query = query.filter_by(semester=mapped_semester)

    # Order by course code for consistent display
    query = query.order_by(LectureMaterial.course_code)

    # NEW: Apply limit if it was provided in the request
    # This will typically be used for the initial load
    if limit is not None:
        query = query.limit(limit)
    # if offset is not None: # For full pagination, you'd add this
    #    query = query.offset(offset)

    materials = query.all()

    return jsonify([material.to_dict() for material in materials])


# 2. Endpoint to handle file downloads by filename
@app.route('/download/<filename>', methods=['GET']) # Changed to use filename directly
def download_material_by_filename(filename): # Renamed function for clarity
    # Find the material by file_name to get its actual file_path
    material = LectureMaterial.query.filter_by(file_name=filename).first()
    
    if material:
        full_file_path = os.path.join(UPLOAD_FOLDER, material.file_name) # Reconstruct the full path
        if os.path.exists(full_file_path):
            # Use send_from_directory for secure file serving
            # UPLOAD_FOLDER is the base directory from which to send
            return send_from_directory(
                UPLOAD_FOLDER,
                material.file_name, # The file name within UPLOAD_FOLDER
                as_attachment=True # Forces browser to download the file
            )
        else:
            # If the database entry exists but the file is missing on disk
            return jsonify({"message": f"File '{filename}' not found on server."}), 404
    
    # If no material found with that filename in the database
    return jsonify({"message": f"Material with filename '{filename}' not found in database."}), 404

# --- Serving Frontend Static Files (using Flask's static_folder) ---
# These routes are now simplified because app = Flask(__name__, static_folder='frontend')
# handles the serving of 'index.html' for '/' and other files for '/<path:path>' automatically.

# The root route (e.g., http://127.0.0.1:5000/) will serve index.html from the 'frontend' folder
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

# This route handles all other static files (CSS, JS, images, etc.) from the 'frontend' folder
@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(app.static_folder, filename)


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host='0.0.0.0', port=port) 