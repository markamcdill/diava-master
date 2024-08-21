from app import app as application # must be called application in order for wsgi to work

if __name__ == "__main__":
    application.run()