import requests
from flask import Flask, request

hook = "647737083393343498/3InrHIdF-J97mleRSUnFgAz9dm7rIZkV9JDlGNaCT8mx3h6PQYsiHyJZEYVi-hDrnAd3"  # replace w/ ur hook

app = Flask(__name__)

@app.route('/')
def index():
    requests.post(f"https://discordapp.com/api/webhooks/{hook}", json={"content": "Someone access '/'"})
    return 'Hello world\n'

@app.route('/log', methods=['GET'])
def log():
    logmsg = request.args.get('message')
    requests.post(f"https://discordapp.com/api/webhooks/{hook}", json={"content": f"{logmsg}"})
    return f'logged {logmsg}\n'

if __name__ == '__main__':
    app.run(debug=False, port=8787, host='0.0.0.0')