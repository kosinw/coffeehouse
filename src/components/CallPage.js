function LoginPage() {
    return (
        <div id="callPage" class="call-page">
            <video id="localVideo" autoplay></video>
            <video id="remoteVideo" autoplay></video>

            <div class="row text-center">
                <div class="col-md-12">
                    <input id="callToUsernameInput" type="text"
                        placeholder="username to call" />
                    <button id="callBtn" class="btn-success btn">Call</button>
                    <button id="hangUpBtn" class="btn-danger btn">Hang Up</button>
                </div>
            </div>

        </div>
    );
}
export default CallPage;