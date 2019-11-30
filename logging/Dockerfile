FROM python

WORKDIR /home/pi/logging

COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8787 
CMD [ "python", "./src/Main.py"]