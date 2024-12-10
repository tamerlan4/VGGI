function generateMesh(R1, R2, height, segments, stacks) {
    const vertices = [];
    const normals = [];
    const indices = [];

    const b = height / 2;

    for (let stack = 0; stack <= stacks; stack++) {
        const a = (height / stacks) * stack;

        for (let seg = 0; seg <= segments; seg++) {
            const angle = (2 * Math.PI / segments) * seg;

            const r = (R2 - R1) * (Math.sin((Math.PI * a) / (4.0 * b)) ** 2) + R1;

            const x = r * Math.cos(angle);
            const y = a - b;
            const z = r * Math.sin(angle);

            vertices.push(x, y, z); // Vertex position

            // Tangent vectors
            const du = [0, 1, 0];
            const dv = [-r * Math.sin(angle), 0, r * Math.cos(angle)];

            // Calculate normal using the cross product of the two tangent vectors
            const normal = m4.normalize(m4.cross(du, dv, []), []);
            normals.push(...normal); // Store normal
        }
    }

    // Generate indices for triangles
    for (let stack = 0; stack < stacks; stack++) {
        for (let seg = 0; seg < segments; seg++) {
            const current = stack * (segments + 1) + seg;
            const next = current + (segments + 1);

            // Two triangles for each quad
            indices.push(current, next, current + 1);
            indices.push(current + 1, next, next + 1);
        }
    }

    // Add bottom cap
    const bottomCenterIndex = vertices.length / 3; // Index of the bottom center vertex
    vertices.push(0, -b, 0); // Bottom center vertex
    normals.push(0, -1, 0); // Normal pointing down

    for (let seg = 0; seg < segments; seg++) {
        const angle = (2 * Math.PI / segments) * seg;
        const x = R1 * Math.cos(angle);
        const z = R1 * Math.sin(angle);

        vertices.push(x, -b, z); // Bottom edge vertex
        normals.push(0, -1, 0); // Normal pointing down
    }

    for (let seg = 0; seg < segments; seg++) {
        const current = bottomCenterIndex + 1 + seg;
        const next = bottomCenterIndex + 1 + ((seg + 1) % segments);
        indices.push(bottomCenterIndex, next, current);
    }

    // Add top cap
    const topCenterIndex = vertices.length / 3; // Index of the top center vertex
    vertices.push(0, b, 0); // Top center vertex
    normals.push(0, 1, 0); // Normal pointing up

    for (let seg = 0; seg < segments; seg++) {
        const angle = (2 * Math.PI / segments) * seg;
        const x = R2 * Math.cos(angle);
        const z = R2 * Math.sin(angle);

        vertices.push(x, b, z); // Top edge vertex
        normals.push(0, 1, 0); // Normal pointing up
    }

    const topOffset = topCenterIndex + 1; // Start index of the top ring
    for (let seg = 0; seg < segments; seg++) {
        const current = topOffset + seg;
        const next = topOffset + ((seg + 1) % segments);
        indices.push(topCenterIndex, current, next);
    }

    return { vertices, normals, indices };
}


export default function Model(gl, shProgram) {
    this.iVertexBuffer = gl.createBuffer();
    this.iNormalBuffer = gl.createBuffer();
    this.iIndexBuffer = gl.createBuffer();
    this.count = 0;

    this.BufferData = function(vertices, normals, indices) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        this.count = indices.length;
    };

    this.Draw = function() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribVertex);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
        gl.vertexAttribPointer(shProgram.iAttribNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribNormal);

        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
    }

    this.CreateSurfaceData = function() {
        const R1 = parseFloat(document.getElementById('R1').value);
        const R2 = parseFloat(document.getElementById('R2').value)
        const height = parseFloat(document.getElementById('height').value);
        const segments = parseInt(document.getElementById('segments').value)
        const stacks = parseInt(document.getElementById('stacks').value)

        const { vertices, normals, indices } = generateMesh(R1, R2, height, segments, stacks);
        this.BufferData(vertices, normals, indices);
    }
}
