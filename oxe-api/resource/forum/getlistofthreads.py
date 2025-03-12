from flask_apispec import MethodResource, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource, reqparse
from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request

class GetListOFThreads(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['forum'],
         description='Get information about a forum by ID',
         params={
             'id': {'description': 'The ID of the forum'},
             'page': {'description': 'The page number'},
             'per_page': {'description': 'Number of threads per page'},
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

        # Validate order
        if order not in ['asc', 'desc']:
            order = 'desc'

        # Calculate offset for pagination
        offset = (page - 1) * per_page

        # Fetch threads with pagination and sorting
        query = f"""
            SELECT * FROM threads_thread
            WHERE forum_id = :forum_id
            ORDER BY last_activity {order}
            LIMIT :limit OFFSET :offset
        """
        threads = self.db.session.execute(query, {"forum_id": id, "limit": per_page, "offset": offset}).fetchall()
        
        total_threads_query = "SELECT COUNT(*) FROM threads_thread WHERE forum_id = :forum_id"
        total_threads = self.db.session.execute(total_threads_query, {"forum_id": id}).scalar()
        total_pages = (total_threads + per_page - 1) // per_page

        # if len(threads) == 0:
        #     return {"message": "Forum not found"}, 404

        threads_data = [dict(thread) for thread in threads]

        return {
            "threads": threads_data,
            "page": page,
            "total_pages": total_pages
        }, 200
