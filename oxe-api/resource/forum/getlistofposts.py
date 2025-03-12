from flask_apispec import MethodResource, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource, reqparse
from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from flask import send_file, jsonify
import os

class GetListOfPosts(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['forum'],
         description='Get information about a forum by ID',
         params={
             'id': {'description': 'The ID of the forum'},
             'page': {'description': 'The page number'},
             'per_page': {'description': 'Number of posts per page'},
             'order': {'description': 'Sort order (asc or desc)'}
         },
         responses={
             "200": {},
             "401": {"description": "Unauthorized"},
         })
    @jwt_required
    @catch_exception
    def get(self, id):
        parser = reqparse.RequestParser()
        parser.add_argument('page', type=int, default=1, location='args')
        parser.add_argument('per_page', type=int, default=6, location='args')
        parser.add_argument('order', type=str, default='desc', location='args')
        args = parser.parse_args()

        page = args['page']
        per_page = args['per_page']
        order = args['order']

        if order not in ['asc', 'desc']:
            order = 'desc'

        offset = (page - 1) * per_page

        query = f"""
            SELECT id, content, updated_at, creator_id, thread_id, is_edited, is_edited, edited_date,is_edited, edited_date,filename FROM posts_post
            WHERE thread_id = :thread_id
            ORDER BY updated_at {order}
            LIMIT :limit OFFSET :offset
        """
        posts = self.db.session.execute(query, {"thread_id": id, "limit": per_page, "offset": offset}).fetchall()
        
        total_posts_query = "SELECT COUNT(*) FROM posts_post WHERE thread_id = :thread_id"
        total_posts = self.db.session.execute(total_posts_query, {"thread_id": id}).scalar()
        total_pages = (total_posts + per_page - 1) // per_page

        posts_data = [dict(post) for post in posts]

        return {
            "posts": posts_data,
            "page": page,
            "total_pages": total_pages
        }, 200

class GetPostDocument(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['forum'],
         description='Get the document associated with a post',
         params={
             'post_id': {'description': 'The ID of the post', 'type': 'integer', 'required': True}
         },
         responses={
             "200": {},
             "401": {"description": "Unauthorized"},
         })
    @jwt_required
    @catch_exception
    def get(self, post_id):
        post = self.db.session.query(self.db.tables["posts_post"]).filter_by(id=post_id).first()
        
        if not post or not post.filename:
            return {"message": "Document not found"}, 404

        file_path = os.path.join("uploads/post_documents/", post.filename)
        
        if not os.path.exists(file_path):
            return {"message": "File not found"}, 404

        return send_file(file_path, as_attachment=True)
