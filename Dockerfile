FROM cmfatih/phantomjs:1.9.7

FOOBAR

# RUN apt-get update
# RUN apt-get install -y python python-pip python-dev

# RUN pip install boto 
# RUN pip install requests
# RUN pip install keen

# ADD watch.py /opt/watch.py
# ADD run_job.js /opt/run_job.js

CMD ["python", "/opt/watch.py"]

