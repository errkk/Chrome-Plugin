from bottle import route, run,request,debug
import simplejson, urllib, json
import subprocess
import mysql.connector
from datetime import datetime
from pprint import pprint

from lib.config import Config
config = Config.dbinfo().copy()

def date_string():
	now = datetime.now()
	return now.strftime('%Y-%m-%d')


def check_quota( ip ):

	datestring = date_string()

	try:
		db = mysql.connector.Connect(**config)
		cursor = db.cursor()
		cursor.execute( 'SELECT count(1) as count FROM skips WHERE ip = "%s" AND date = "%s";' % ( ip, datestring ) )


		for i in cursor.fetchall():
			count = int(i[0])

		db.close()

		return int(3 - count)

	except:
		print 'didnt work'
		return 4


def log_skip( ip, name ):
	datestring = date_string()
	try:
		db = mysql.connector.Connect(**config)
		cursor = db.cursor()
		cursor.execute( 'INSERT INTO `skips` (ip, date, name) VALUES ("%s", "%s", "%s");' % ( ip, datestring, name ) )
		db.close()
	except:
		print 'didnt work'



@route('/check/')
def index():
	ip = request.environ.get('REMOTE_ADDR')
	quota = check_quota( ip )
	response = { 'status' : 'ok', 'quota' : quota }
	return json.dumps( response )

@route('/next/:name')
def next(name):
	
	ip = request.environ.get('REMOTE_ADDR')
	quota = check_quota( ip )

	response = {}

	if quota < 1:
		response['status'] = 'Over Quota'
		response['quota'] = quota
		return json.dumps( response )
	else:

		try:
#            subprocess.call(['sh/next.sh'])
			status = 'ok'
		except:
			error= 'Could not do shell script'
			status = 'fail'
			response['error'] = error
			print error

	log_skip( ip, name )

	response['status'] = status
	response['quota'] = int( quota - 1 )
	return json.dumps( response )



debug(True)

run( server='tornado', port=8080 )




