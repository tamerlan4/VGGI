function generateConjugatedCylindersLines(R1, R2, height, segments, stacks) {
    const vertices = [];
    const indices = [];

    const b = height / 2;

    for (let stack = 0; stack <= stacks; stack++) {
        const a = (height / stacks) * stack;

        for (let seg = 0; seg <= segments; seg++) {
            const angle = (2 * Math.PI / segments) * seg;

            const r = (R2 - R1) * (Math.sin((Math.PI * a) / (4.0 * b)) ** 2) + R1;

            const x = r * Math.cos(angle);
            const z = r * Math.sin(angle);
            vertices.push(x, a - b, z); // Y axis is up axis for OpenGL
        }
    }

    for (let stack = 0; stack < stacks; stack++) {
        for (let seg = 0; seg <= segments; seg++) {
            const current = stack * (segments + 1) + seg;
            const next = current + (segments + 1);

            indices.push(current, next);

            if (seg < segments) {
                indices.push(current, current + 1);
            }
        }
    }

    // Add last circle indices
    const lastCircleStart = stacks * (segments + 1);
    for (let seg = 0; seg < segments; seg++) {
        const current = lastCircleStart + seg;
        const next = lastCircleStart + (seg + 1) % (segments + 1);

        indices.push(current, next);
    }

    return { vertices, indices };
}

function Model() {
    this.iVertexBuffer = gl.createBuffer();
    this.iIndexBuffer = gl.createBuffer();
    this.count = 0;

    this.BufferData = function(vertices, indices) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        this.count = indices.length;
    };

    this.Draw = function() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribVertex);

        gl.drawElements(gl.LINES, this.count, gl.UNSIGNED_SHORT, 0);
    }

    this.CreateSurfaceData = function() {
        const R1 = parseFloat(document.getElementById('R1').value);
        const R2 = parseFloat(document.getElementById('R2').value)
        const height = parseFloat(document.getElementById('height').value);
        const segments = parseInt(document.getElementById('segments').value)
        const stacks = parseInt(document.getElementById('stacks').value)

        const { vertices, indices } = generateConjugatedCylindersLines(R1, R2, height, segments, stacks);
        this.BufferData(vertices, indices);
    }
}
