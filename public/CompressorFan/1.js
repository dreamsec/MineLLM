var unityInstance = UnityLoader.instantiate("CompressorFan", "Build/WebGLBuild.json", {
            onProgress: UnityProgress,
            onComplete: function(instance) {
                console.log("Unity实例加载完成");
            }
        });

        // 向Unity发送消息的函数
        function sendMessageToUnity() {
            // 获取输入的消息
            var messageInput = document.getElementById("messageInput");
            var message = messageInput.value.trim();
            
            if (message) {
                // 调用Unity中的函数
                // 格式：unityInstance.SendMessage(GameObject名称, 函数名称, 参数)
                unityInstance.SendMessage("c1", "SetTextInfo", message);
                console.log("已发送消息到Unity: " + message);
            } else {
                alert("请输入消息内容");
            }
        }
