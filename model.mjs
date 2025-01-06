function normalizeUV(value, min, max) {
    return (value - min) / (max - min);
}

function generateMesh(R1, R2, height, segments, stacks) {
    const vertices = [];
    const normals = [];
    const indices = [];
    const tangents = [];
    const uvs = [];

    const b = height / 2;

    for (let stack = 0; stack <= stacks; stack++) {
        const a = (height / stacks) * stack;

        for (let seg = 0; seg <= segments; seg++) {
            const angle = (2 * Math.PI / segments) * seg;

            const r = (R2 - R1) * (Math.sin((Math.PI * a) / (4.0 * b)) ** 2) + R1;

            const x = r * Math.cos(angle);
            const y = a - b;
            const z = r * Math.sin(angle);

            vertices.push(x, y, z); 

            const du = [0, 1, 0];
            const dv = m4.normalize([-r * Math.sin(angle), 0, r * Math.cos(angle)], []);

            const normal = m4.normalize(m4.cross(du, dv, []), []);
            normals.push(...normal);

            tangents.push(...du);
            uvs.push(normalizeUV(a, 0, height), normalizeUV(angle, 0, 2 * Math.PI));
        }
    }

    for (let stack = 0; stack < stacks; stack++) {
        for (let seg = 0; seg < segments; seg++) {
            const current = stack * (segments + 1) + seg;
            const next = current + (segments + 1);

            indices.push(current, next, current + 1);
            indices.push(current + 1, next, next + 1);
        }
    }

    return { vertices, normals, tangents, uvs, indices };
}

export default function Model(gl, shProgram) {
    this.iVertexBuffer = gl.createBuffer();
    this.iNormalBuffer = gl.createBuffer();
    this.iTangentBuffer = gl.createBuffer();
    this.iUVBuffer = gl.createBuffer();
    this.iIndexBuffer = gl.createBuffer();

    this.idTextureDiffuse = LoadTexture(gl, "./textures/diffuse.jpg");
    this.idTextureNormal = LoadTexture(gl, "./textures/normal.jpg");
    this.idTextureSpecular = LoadTexture(gl, "./textures/specular.jpg");

    this.point = [0.5, 0.5];
    this.uvBuffer = [];
    this.indexBuffer = [];

    this.count = 0;

    this.BufferData = function(vertices, normals, tangents, uvs, indices) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iTangentBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tangents), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iUVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        this.uvBuffer = uvs;
        this.indexBuffer = indices;

        this.count = indices.length;
    };

    this.Draw = function() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribVertex);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
        gl.vertexAttribPointer(shProgram.iAttribNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribNormal);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iTangentBuffer);
        gl.vertexAttribPointer(shProgram.iAttribTangent, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribTangent);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iUVBuffer);
        gl.vertexAttribPointer(shProgram.iAttribUV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribUV);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.idTextureDiffuse);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.idTextureNormal);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.idTextureSpecular);

        gl.uniform2fv(shProgram.iPoint, this.point);
        gl.uniform1f(shProgram.iAngle, parseFloat(document.getElementById('Angle').value) * (Math.PI / 180.0));

        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
    }

    this.CreateSurfaceData = function() {
        const R1 = parseFloat(document.getElementById('R1').value);
        const R2 = parseFloat(document.getElementById('R2').value)
        const height = parseFloat(document.getElementById('height').value);
        const segments = parseInt(document.getElementById('segments').value)
        const stacks = parseInt(document.getElementById('stacks').value)

        const { vertices, normals, tangents, uvs, indices } = generateMesh(R1, R2, height, segments, stacks);
        this.BufferData(vertices, normals, tangents, uvs, indices);
    }
}
