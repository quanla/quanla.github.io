function Bot() {
    this.run = function (control) {
        var enemies = control.getEnemies();
        if (Cols.isEmpty(enemies)) {
            return; // Relax, no one around
        }

        var minDisE = Cols.findMin(enemies, function(enemy) {
            return Distance.between(control.position, enemy.position);
        });

        if (Distance.between(control.position, minDisE.position) < 50) {
            control.direction = Vectors.toVector( Vectors.subtractPos(control.position, minDisE.position)).direction + (Math.PI/4 * Math.random() - Math.PI/8);
            control.goForward();
        } else {
            control.setDirection(minDisE.position);
            control.stand();
        }
    };
}