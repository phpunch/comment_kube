FROM python

WORKDIR /home/pi/logging

COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD [ "python", "./src/Main.py"]