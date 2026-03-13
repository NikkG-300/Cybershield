from flask import Flask,request,jsonify

app = Flask(__name__)

@app.route("/detect_email",methods=["POST"])
def detect_email():

    email=request.json["email"]

    if "urgent" in email.lower():

        return jsonify({"phishing":True})

    return jsonify({"phishing":False})


if __name__ == "__main__":

    app.run(debug=True)