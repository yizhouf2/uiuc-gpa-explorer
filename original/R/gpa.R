calc_gpa = function(data) {
  data |>
    mutate(n = `A+` +
                A +
               `A-` +
               `B+` +
                B +
               `B-` +
               `C+` +
                C +
               `C-` +
               `D+` +
                D +
               `D-` +
                F) |>
    mutate(pts = 4.00 * `A+` +
                 4.00 * A +
                 3.67 * `A-` +
                 3.33 * `B+` +
                 3.00 * B +
                 2.67 * `B-` +
                 2.33 * `C+` +
                 2.00 * C +
                 1.67 * `C-` +
                 1.33 * `D+` +
                 1.00 * D +
                 0.67 * `D-` +
                 0.00 * F) |>
    mutate(GPA = round(pts / n, digits = 2)) |>
    select(-n, -pts)
}
