sudo setenforce Permissive
sudo systemctl restart nginx
LD_LIBRARY_PATH=~/anaconda3/lib uwsgi --ini app.ini